import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const DEFAULT_TRACKALL_API_URL = "https://trackall.nightly.app/";
const SOLANA_WS_PATH = "api/solana/ws";
const BLOCK_META_CHANNEL = "blocks.meta";
const TRANSACTIONS_CHANNEL = "transactions.integrations";
const MAX_BLOCKS = 48;
const TRANSACTION_WINDOW_MS = 5_000;
const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export type BlockStreamStatus = "idle" | "connecting" | "subscribed" | "error";

export type BlockEntry = {
  id: string;
  blockhash?: string;
  blockHeight?: string;
  blockTime?: string;
  parentBlockhash?: string;
  parentSlot?: string;
  receivedAt: string;
  receivedLagMs: number | null;
  slot: string;
};

type SolanaReadyMessage = {
  channels: string[];
  network: "solana";
  type: "ready";
};

type SolanaSubscriptionMessage = {
  channel: string;
  type: "subscribed" | "unsubscribed";
};

type SolanaErrorMessage = {
  error: string;
  type: "error";
};

type SolanaBlockMetaMessage = {
  blockhash?: string;
  blockHeight?: string;
  blockTime?: string;
  commitment: "processed";
  parentBlockhash?: string;
  parentSlot?: string;
  receivedAt: string;
  slot: string;
  type: "solana.blockMeta";
};

export type SolanaTransactionMessage = {
  accountKeys: string[];
  failed: boolean;
  index: string;
  matchedProgramIds: string[];
  receivedAt: string;
  signature: string;
  slot: string;
  type: "solana.transaction";
};

type SolanaWsMessage =
  | SolanaBlockMetaMessage
  | SolanaErrorMessage
  | SolanaReadyMessage
  | SolanaSubscriptionMessage
  | SolanaTransactionMessage;

function normalizeBaseUrl(value: string | undefined) {
  const raw = value?.trim() || DEFAULT_TRACKALL_API_URL;
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function buildSolanaWsUrl(baseUrl: string | undefined, apiKey: string | undefined) {
  const trimmedApiKey = apiKey?.trim();
  if (!trimmedApiKey) {
    throw new Error("Missing VITE_TRACKALL_API_KEY");
  }

  const url = new URL(SOLANA_WS_PATH, normalizeBaseUrl(baseUrl));
  if (url.protocol === "https:") {
    url.protocol = "wss:";
  } else if (url.protocol === "http:") {
    url.protocol = "ws:";
  } else {
    throw new Error(`Unsupported Trackall API protocol: ${url.protocol}`);
  }

  url.searchParams.set("apiKey", trimmedApiKey);
  return url.toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseWsMessage(value: string): SolanaWsMessage | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isRecord(parsed)) return null;

    const type = parsed.type;
    if (type === "ready") {
      const network = parsed.network;
      const channels = parsed.channels;
      if (network === "solana" && Array.isArray(channels)) {
        return {
          channels: channels.filter((channel): channel is string => typeof channel === "string"),
          network,
          type,
        };
      }
    }

    if ((type === "subscribed" || type === "unsubscribed") && typeof parsed.channel === "string") {
      return { channel: parsed.channel, type };
    }

    if (type === "error" && typeof parsed.error === "string") {
      return { error: parsed.error, type };
    }

    if (type === "solana.blockMeta" && typeof parsed.slot === "string" && typeof parsed.receivedAt === "string") {
      return {
        blockhash: readString(parsed.blockhash),
        blockHeight: readString(parsed.blockHeight),
        blockTime: readString(parsed.blockTime),
        commitment: "processed",
        parentBlockhash: readString(parsed.parentBlockhash),
        parentSlot: readString(parsed.parentSlot),
        receivedAt: parsed.receivedAt,
        slot: parsed.slot,
        type,
      };
    }

    if (
      type === "solana.transaction" &&
      typeof parsed.slot === "string" &&
      typeof parsed.index === "string" &&
      typeof parsed.signature === "string" &&
      typeof parsed.receivedAt === "string"
    ) {
      return {
        accountKeys: readStringArray(parsed.accountKeys),
        failed: parsed.failed === true,
        index: parsed.index,
        matchedProgramIds: readStringArray(parsed.matchedProgramIds),
        receivedAt: parsed.receivedAt,
        signature: parsed.signature,
        slot: parsed.slot,
        type,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function toBlockEntry(message: SolanaBlockMetaMessage): BlockEntry {
  const receivedAtMs = Date.parse(message.receivedAt);
  const receivedLagMs = Number.isNaN(receivedAtMs) ? null : Math.max(0, Date.now() - receivedAtMs);

  return {
    blockhash: message.blockhash,
    blockHeight: message.blockHeight,
    blockTime: message.blockTime,
    id: message.blockhash ? `${message.slot}:${message.blockhash}` : message.slot,
    parentBlockhash: message.parentBlockhash,
    parentSlot: message.parentSlot,
    receivedAt: message.receivedAt,
    receivedLagMs,
    slot: message.slot,
  };
}

function upsertBlock(blocks: BlockEntry[], next: BlockEntry) {
  return [
    next,
    ...blocks.filter((block) => {
      if (block.id === next.id || block.slot === next.slot) return false;
      return next.blockhash == null || block.blockhash !== next.blockhash;
    }),
  ].slice(0, MAX_BLOCKS);
}

function transactionTimestampMs(message: SolanaTransactionMessage) {
  const parsed = Date.parse(message.receivedAt);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function pruneTransactionTimestamps(timestamps: number[], now = Date.now()) {
  const windowStartedAt = now - TRANSACTION_WINDOW_MS;
  return timestamps.filter((timestamp) => timestamp >= windowStartedAt);
}

export type UseBlockStreamOptions = {
  onTransaction?: (tx: SolanaTransactionMessage) => void;
};

export function useBlockStream(options?: UseBlockStreamOptions) {
  const [blocks, setBlocks] = useState<BlockEntry[]>([]);
  const [status, setStatus] = useState<BlockStreamStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<BlockStreamStatus>("idle");
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionTimestamps, setTransactionTimestamps] = useState<number[]>([]);

  const onTransactionRef = useRef<UseBlockStreamOptions["onTransaction"]>(undefined);
  useLayoutEffect(() => {
    onTransactionRef.current = options?.onTransaction;
  }, [options?.onTransaction]);

  useEffect(() => {
    if (typeof WebSocket === "undefined") {
      setStatus("error");
      setError("WebSocket is not available in this browser");
      setTransactionStatus("error");
      setTransactionError("WebSocket is not available in this browser");
      return;
    }

    let cancelled = false;
    let reconnectTimer: number | null = null;
    let pruneTimer: number | null = null;
    let reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS;
    let socket: WebSocket | null = null;

    const clearReconnectTimer = () => {
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const connect = () => {
      let wsUrl: string;
      try {
        wsUrl = buildSolanaWsUrl(
          import.meta.env.VITE_TRACKALL_API_URL,
          import.meta.env.VITE_TRACKALL_API_KEY,
        );
      } catch (connectError) {
        setStatus("error");
        setError(connectError instanceof Error ? connectError.message : String(connectError));
        setTransactionStatus("error");
        setTransactionError(connectError instanceof Error ? connectError.message : String(connectError));
        return;
      }

      setStatus((current) => (current === "subscribed" ? current : "connecting"));
      setTransactionStatus((current) => (current === "subscribed" ? current : "connecting"));
      setError(null);
      setTransactionError(null);

      socket = new WebSocket(wsUrl);

      socket.addEventListener("open", () => {
        reconnectDelayMs = INITIAL_RECONNECT_DELAY_MS;
      });

      socket.addEventListener("message", (event) => {
        const data = typeof event.data === "string" ? event.data : null;
        if (data == null) return;

        const message = parseWsMessage(data);
        if (message == null) return;

        if (message.type === "ready") {
          if (message.channels.includes(BLOCK_META_CHANNEL) && socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "subscribe", channel: BLOCK_META_CHANNEL }));
          }
          if (message.channels.includes(TRANSACTIONS_CHANNEL) && socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "subscribe", channel: TRANSACTIONS_CHANNEL }));
          } else {
            setTransactionStatus("error");
            setTransactionError("Transaction stream is unavailable");
          }
          return;
        }

        if (message.type === "subscribed" && message.channel === BLOCK_META_CHANNEL) {
          setStatus("subscribed");
          setError(null);
          return;
        }

        if (message.type === "subscribed" && message.channel === TRANSACTIONS_CHANNEL) {
          setTransactionStatus("subscribed");
          setTransactionError(null);
          return;
        }

        if (message.type === "error") {
          setStatus("error");
          setError(message.error);
          setTransactionStatus("error");
          setTransactionError(message.error);
          return;
        }

        if (message.type === "solana.blockMeta") {
          setStatus("subscribed");
          setError(null);
          setBlocks((current) => upsertBlock(current, toBlockEntry(message)));
        }

        if (message.type === "solana.transaction") {
          setTransactionStatus("subscribed");
          setTransactionError(null);
          setTransactionTimestamps((current) =>
            pruneTransactionTimestamps([...current, transactionTimestampMs(message)]),
          );
          onTransactionRef.current?.(message);
        }
      });

      socket.addEventListener("error", () => {
        setStatus("error");
        setError("Block stream connection failed");
        setTransactionStatus("error");
        setTransactionError("Transaction stream connection failed");
      });

      socket.addEventListener("close", () => {
        if (cancelled) return;
        setStatus("connecting");
        setTransactionStatus("connecting");
        reconnectTimer = window.setTimeout(connect, reconnectDelayMs);
        reconnectDelayMs = Math.min(reconnectDelayMs * 2, MAX_RECONNECT_DELAY_MS);
      });
    };

    connect();
    pruneTimer = window.setInterval(() => {
      setTransactionTimestamps((current) => pruneTransactionTimestamps(current));
    }, 1_000);

    return () => {
      cancelled = true;
      clearReconnectTimer();
      if (pruneTimer !== null) window.clearInterval(pruneTimer);
      socket?.close();
    };
  }, []);

  const transactionWindowCount = transactionTimestamps.length;
  const transactionsPerSecond = transactionWindowCount / (TRANSACTION_WINDOW_MS / 1_000);

  return useMemo(
    () => ({
      blocks,
      error,
      status,
      transactionError,
      transactionStatus,
      transactionWindowCount,
      transactionsPerSecond,
    }),
    [
      blocks,
      error,
      status,
      transactionError,
      transactionStatus,
      transactionWindowCount,
      transactionsPerSecond,
    ],
  );
}
