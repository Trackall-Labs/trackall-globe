import {
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ArrowDownRightIcon,
	ArrowUpRightIcon,
	CopyIcon,
	ExternalLinkIcon,
	GemIcon,
	LandmarkIcon,
	SearchIcon,
	SparklesIcon,
	TelescopeIcon,
	WalletIcon,
	WavesIcon,
} from "lucide-react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
	Accordion,
	AccordionItem,
	AccordionPanel,
	AccordionTrigger,
} from "@orbit/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@orbit/ui/avatar";
import { Badge } from "@orbit/ui/badge";
import { Button } from "@orbit/ui/button";
import { Card } from "@orbit/ui/card";
import { ParticleField } from "@orbit/ui/particle-field";
import { Chart } from "@orbit/ui/patterns/charts";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@orbit/ui/empty";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@orbit/ui/input-group";
import { Separator } from "@orbit/ui/separator";
import { Tabs, TabsList, TabsTab } from "@orbit/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@orbit/ui/table";
import { toastManager } from "@orbit/ui/toast";
import dustyFieldSrc from "../../../../packages/ui/src/assets/figures/dusty-field.png";
import { PROTOCOLS } from "@/lib/protocols";
import {
	type AllocationKind,
	DefiGroupKind,
	type DefiPositionGroup,
	type PortfolioMock,
	formatPct,
	formatUsd,
	formatUsdCompact,
	formatUsdDelta,
	getPortfolioMockForNetwork,
	mapTrackallPortfolioToViewModel,
	shortenAddress,
} from "@/lib/portfolio-mock";
import {
	fetchSolanaPortfolioPlot,
	fetchSolanaPositionCache,
	fetchSolanaPositions,
	fetchSolanaTokenMetadata,
	fetchSolanaTokens,
	type TrackallSolanaPortfolioPlot,
	type TrackallSolanaPortfolioPlotBucket,
	type TrackallSolanaPortfolioPlotPoint,
	type TrackallSolanaPosition,
	type TrackallSolanaToken,
} from "@/lib/trackall-api";
import type { Network } from "@/lib/networks";
import type { Protocol } from "@/lib/types";

function copyToClipboard(value: string) {
	if (typeof navigator === "undefined" || !navigator.clipboard) return;
	navigator.clipboard
		.writeText(value)
		.then(() => {
			toastManager.add({
				id: `clipboard-${Date.now()}`,
				title: "Address copied",
				description: shortenAddress(value),
				type: "info",
				timeout: 2500,
			});
		})
		.catch(() => {
			// ignore — toast omitted on failure
		});
}

function deltaColorClasses(value: number) {
	if (value > 0) return "text-emerald-600 dark:text-emerald-400";
	if (value < 0) return "text-rose-600 dark:text-rose-400";
	return "text-muted-foreground";
}

const TOKEN_LOGOS: Record<string, string> = {
	SOL: "/network-logos/solana.svg",
	USDC: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
	pbUSDC:
		"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
	jlWSOL: "/protocol-logos/jupiter.webp",
	jlEURC: "/protocol-logos/jupiter.webp",
	JUP: "/protocol-logos/jupiter.webp",
	JupSOL: "/protocol-logos/jupiter.webp",
	stSOL: "https://www.google.com/s2/favicons?domain=marinade.finance&sz=128",
	zBTC: "https://www.google.com/s2/favicons?domain=zeusnetwork.xyz&sz=128",
};

const PROTOCOL_LOGOS: Record<string, string> = {
	loopscale: "https://www.google.com/s2/favicons?domain=loopscale.app&sz=128",
	omnipair: "https://www.google.com/s2/favicons?domain=omnipair.io&sz=128",
	kamino: "https://www.google.com/s2/favicons?domain=kamino.finance&sz=128",
	meteora: "https://www.google.com/s2/favicons?domain=meteora.ag&sz=128",
	metapool: "https://www.google.com/s2/favicons?domain=metapool.app&sz=128",
};

const WALLET_PLOT_BUCKETS: {
	label: string;
	value: TrackallSolanaPortfolioPlotBucket;
}[] = [
	{ label: "1H", value: "1h" },
	{ label: "4H", value: "4h" },
	{ label: "1D", value: "1d" },
];
const DEFAULT_WALLET_PLOT_BUCKET: TrackallSolanaPortfolioPlotBucket = "4h";

function assetPrimarySymbol(value: string) {
	return value.split("—")[0]?.trim().split(/\s+/).pop() ?? value;
}

function LogoAvatar({
	alt,
	color,
	fallback,
	shape = "circle",
	src,
	className = "size-9",
}: {
	alt: string;
	color?: string;
	fallback: string;
	shape?: "circle" | "square";
	src?: string;
	className?: string;
}) {
	const shapeClass = shape === "square" ? "rounded-xl" : "rounded-full";

	return (
		<Avatar
			className={
				className +
				" " +
				shapeClass +
				" border border-border/60 bg-background/65 shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_10%,transparent)_inset]"
			}
		>
			{src ? (
				<AvatarImage
					src={src}
					alt={alt}
					className={
						shape === "square"
							? "rounded-[inherit] object-cover p-0"
							: "rounded-[inherit] object-contain p-1"
					}
				/>
			) : null}
			<AvatarFallback
				className="rounded-[inherit] font-mono text-[10px] uppercase tracking-[0.14em]"
				style={{
					background: `linear-gradient(135deg, ${color ?? "var(--muted)"}, transparent)`,
				}}
			>
				{fallback.slice(0, 3)}
			</AvatarFallback>
		</Avatar>
	);
}

function TokenLogo({
	color,
	logoUrl,
	shape,
	symbol,
	className,
}: {
	color?: string;
	logoUrl?: string;
	shape?: "circle" | "square";
	symbol: string;
	className?: string;
}) {
	return (
		<LogoAvatar
			alt={`${symbol} logo`}
			color={color}
			fallback={symbol}
			shape={shape}
			src={logoUrl ?? TOKEN_LOGOS[symbol]}
			className={className}
		/>
	);
}

function ProtocolLogo({
	color,
	shape,
	protocolId,
	protocolName,
	logoUrl,
	className,
}: {
	color?: string;
	shape?: "circle" | "square";
	protocolId: string;
	protocolName: string;
	logoUrl?: string;
	className?: string;
}) {
	return (
		<LogoAvatar
			alt={`${protocolName} logo`}
			color={color}
			fallback={protocolName}
			shape={shape}
			src={logoUrl ?? PROTOCOL_LOGOS[protocolId]}
			className={className}
		/>
	);
}

function defiKindClasses(kind: DefiGroupKind): string {
	switch (kind) {
		case DefiGroupKind.Lending:
			return "border-rose-500/40 bg-rose-500/8 text-rose-600 dark:text-rose-400";
		case DefiGroupKind.Supplied:
			return "border-violet-500/40 bg-violet-500/8 text-violet-600 dark:text-violet-400";
		case DefiGroupKind.Borrowing:
			return "border-amber-500/40 bg-amber-500/8 text-amber-600 dark:text-amber-400";
		case DefiGroupKind.Liquidity:
			return "border-emerald-500/40 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400";
		case DefiGroupKind.Staking:
			return "border-sky-500/40 bg-sky-500/8 text-sky-600 dark:text-sky-400";
		case DefiGroupKind.Rewards:
			return "border-emerald-500/40 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400";
		case DefiGroupKind.Fees:
			return "border-cyan-500/40 bg-cyan-500/8 text-cyan-600 dark:text-cyan-400";
	}
}

function AddressChip({
	address,
	className,
	copyable = true,
}: {
	address: string;
	className?: string;
	copyable?: boolean;
}) {
	return (
		<span
			className={
				"inline-flex h-7 items-center gap-1.5 rounded-full border border-border/60 bg-background/55 px-2.5 font-mono text-[11px] text-muted-foreground " +
				(className ?? "")
			}
		>
			<span>{shortenAddress(address)}</span>
			{copyable ? (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						copyToClipboard(address);
					}}
					aria-label="Copy address"
					className="grid size-4 place-items-center rounded text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
				>
					<CopyIcon className="size-3" />
				</button>
			) : null}
		</span>
	);
}

function SearchAddressInput({
	size = "default",
	onSubmit,
}: {
	size?: "default" | "sm";
	onSubmit: (address: string) => void;
}) {
	const [value, setValue] = useState("");

	return (
		<form
			className={size === "sm" ? "w-full max-w-sm" : "w-full"}
			onSubmit={(e) => {
				e.preventDefault();
				if (value.trim()) {
					onSubmit(value.trim());
					setValue("");
				}
			}}
		>
			<InputGroup
				className={
					size === "sm"
						? "h-10 rounded-full border-border/60 bg-background/50 p-1 text-sm shadow-[0_10px_28px_-22px_color-mix(in_oklab,var(--foreground)_55%,transparent)] ring-0 backdrop-blur-xl transition-[background-color,border-color,box-shadow] before:hidden hover:border-border/80 hover:bg-background/60 focus-within:border-ring/50 focus-within:bg-background/65 focus-within:ring-0 focus-within:shadow-[0_10px_28px_-22px_color-mix(in_oklab,var(--foreground)_60%,transparent)] has-[input:focus-visible]:ring-0"
						: "h-14 rounded-full border-border/70 bg-background/55 p-1 text-base shadow-[0_1px_0_0_color-mix(in_oklab,var(--foreground)_8%,transparent)_inset,0_16px_40px_-26px_color-mix(in_oklab,var(--foreground)_55%,transparent)] ring-0 backdrop-blur-xl transition-[background-color,border-color,box-shadow] before:hidden hover:border-border hover:bg-background/65 focus-within:border-ring/50 focus-within:bg-background/70 focus-within:ring-0 focus-within:shadow-[0_18px_46px_-26px_color-mix(in_oklab,var(--foreground)_65%,transparent)] has-[input:focus-visible]:ring-0"
				}
			>
				<InputGroupInput
					aria-label="Wallet address"
					placeholder={
						size === "sm" ? "Search address" : "Search wallet address"
					}
					type="search"
					value={value}
					className={
						"h-full min-w-0 bg-transparent px-2 placeholder:text-muted-foreground/70 " +
						(size === "sm" ? "text-sm" : "text-[15px]")
					}
					onChange={(e) => setValue(e.target.value)}
				/>
				<InputGroupAddon align="inline-start" className="ps-3">
					<span
						aria-hidden
						className={
							"grid shrink-0 place-items-center rounded-full bg-foreground/[0.04] text-muted-foreground " +
							(size === "sm" ? "size-6" : "size-8")
						}
					>
						<SearchIcon className={size === "sm" ? "size-3.5" : "size-4"} />
					</span>
				</InputGroupAddon>
				<InputGroupAddon
					align="inline-end"
					className="pe-1.5 has-[>button]:me-0"
				>
					<Button
						type="submit"
						size={size === "sm" ? "sm" : "default"}
						variant="default"
						className={
							"rounded-full px-4 shadow-[0_8px_20px_-12px_color-mix(in_oklab,var(--foreground)_70%,transparent)] disabled:shadow-none " +
							(size === "sm" ? "h-8" : "h-11 min-w-16")
						}
						disabled={!value.trim()}
					>
						Go
					</Button>
				</InputGroupAddon>
			</InputGroup>
		</form>
	);
}

type SampleWallet = {
	label: string;
	hint: string;
	address: string;
	icon: React.ComponentType<{ className?: string }>;
	accent: string;
};

const SOLANA_SAMPLE_WALLETS: SampleWallet[] = [
	{
		label: "Jupiter litterbox",
		hint: "Jupiter wallet",
		address: "6tZT9AUcQn4iHMH79YZEXSy55kDLQ4VbA3PMtfLVNsFX",
		icon: GemIcon,
		accent: "var(--chart-1)",
	},
	{
		label: "Kamino Whale",
		hint: "Kamino Whale",
		address: "3XmgTpc3bndpMdksjoN7jtd6nWsCvm6gSoJvTcySxCEP",
		icon: WavesIcon,
		accent: "var(--chart-3)",
	},
	{
		label: "Defi Degen",
		hint: "Defi Degen",
		address: "93PSyNrS7zBhrXaHHfU1ZtfegcKq5SaCYc35ZwPVrK3K",
		icon: LandmarkIcon,
		accent: "var(--chart-5)",
	},
];

const SUI_SAMPLE_WALLETS: SampleWallet[] = [
	{
		label: "NAVI lender",
		hint: "Lending market",
		address:
			"0x3a12d9c7f48b1e6a9d02f6c48a13eaf56b821c9d40e5f72a6c1890b7a5d2c9ef",
		icon: LandmarkIcon,
		accent: "var(--chart-1)",
	},
	{
		label: "Suilend whale",
		hint: "Money market",
		address:
			"0x8f4e1c6b9a2d3750e1b4f68a93c7d52e04f9a6b1c8d3e572f0a4c91b6d8e23a",
		icon: WavesIcon,
		accent: "var(--chart-3)",
	},
	{
		label: "Cetus LP",
		hint: "DEX liquidity",
		address:
			"0xc7b2a60d91e43f8a2c5d7b0e16f94a83d527c0b6e9f14a38d20c5b7e61f9a04d",
		icon: GemIcon,
		accent: "var(--chart-5)",
	},
];

const SAMPLE_WALLETS_BY_NETWORK: Record<string, SampleWallet[]> = {
	solana: SOLANA_SAMPLE_WALLETS,
	sui: SUI_SAMPLE_WALLETS,
};

function mockAddressForNetwork(network: Network, index: number) {
	if (network.evmCompatible) {
		const seed = (network.id + index).replace(/[^a-f0-9]/gi, "");
		return `0x${(seed + "0123456789abcdef".repeat(3)).slice(0, 40)}`;
	}

	return `${network.symbol}${index + 1}MockWallet${network.id.replace(/[^a-z0-9]/gi, "")}Address9xQp7Lm2T`;
}

function sampleWalletsForNetwork(network: Network | null): SampleWallet[] {
	if (!network) return SOLANA_SAMPLE_WALLETS;
	const explicit = SAMPLE_WALLETS_BY_NETWORK[network.id];
	if (explicit) return explicit;

	const protocols = PROTOCOLS.filter((protocol) =>
		protocol.networks.some(
			(name) => name.toLowerCase() === network.name.toLowerCase(),
		),
	).slice(0, 3);
	const fallbackLabels = [
		{
			label: `${network.name} treasury`,
			hint: `${network.symbol} holdings`,
			icon: GemIcon,
		},
		{
			label: `${network.name} validator`,
			hint: "Staking wallet",
			icon: WavesIcon,
		},
		{
			label: `${network.name} vault`,
			hint: "DeFi position",
			icon: LandmarkIcon,
		},
	];

	return Array.from({ length: 3 }, (_, index) => {
		const protocol = protocols[index];
		const fallback = fallbackLabels[index];
		return {
			label: protocol ? `${protocol.name} wallet` : fallback.label,
			hint: protocol ? protocol.category : fallback.hint,
			address: mockAddressForNetwork(network, index),
			icon: protocol
				? protocol.category === "Lending"
					? LandmarkIcon
					: protocol.category === "Staking"
						? WavesIcon
						: GemIcon
				: fallback.icon,
			accent: `var(--chart-${(index % 5) + 1})`,
		};
	});
}

function PortfolioEmptyBackground() {
	const typingImpulse = useRef(0);

	return (
		<div aria-hidden className="absolute inset-0 overflow-hidden">
			<ParticleField
				src={dustyFieldSrc}
				sampleStep={2}
				threshold={48}
				dotSize={0.9}
				renderScale={1}
				align="center"
				mouseForce={120}
				mouseRadius={140}
				typingImpulseRef={typingImpulse}
				trackPointerAcrossPage
			/>

			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(1200px 800px at 50% 45%, transparent 35%, color-mix(in srgb, var(--background) 80%, transparent) 95%)",
				}}
			/>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
				style={{
					background:
						"linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--background) 50%, transparent) 35%, color-mix(in srgb, var(--background) 90%, transparent) 70%, var(--background) 100%)",
				}}
			/>
		</div>
	);
}

function PortfolioDetailBackground() {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 overflow-hidden"
		>
			<div
				className="absolute inset-0"
				style={{
					background: "var(--background)",
				}}
			/>
			<div
				className="absolute inset-0 opacity-[0.35]"
				style={{
					backgroundImage:
						"linear-gradient(to right, color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 1px)",
					backgroundSize: "48px 48px",
					maskImage:
						"radial-gradient(ellipse at center, black 35%, transparent 75%)",
				}}
			/>
		</div>
	);
}

function SampleWalletCard({
	wallet,
	onPick,
}: {
	wallet: SampleWallet;
	onPick: (addr: string) => void;
}) {
	const Icon = wallet.icon;
	return (
		<button
			type="button"
			onClick={() => onPick(wallet.address)}
			className="group relative flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-4 text-left backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-border hover:bg-background/60 hover:shadow-[0_8px_28px_-16px_color-mix(in_oklab,var(--foreground)_45%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			<span
				aria-hidden
				className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-60"
			/>
			<div className="flex items-center justify-between">
				<span
					className="grid size-9 shrink-0 place-items-center rounded-lg border border-border/60 text-foreground/80 transition-colors group-hover:text-foreground"
					style={{
						background: `linear-gradient(135deg, color-mix(in oklab, ${wallet.accent} 28%, transparent), transparent)`,
					}}
				>
					<Icon className="size-4" />
				</span>
				<ArrowUpRightIcon className="size-4 text-muted-foreground/60 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
			</div>
			<div className="min-w-0">
				<div className="truncate text-sm font-medium text-foreground">
					{wallet.label}
				</div>
				<div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
					{wallet.hint}
				</div>
			</div>
			<div className="font-mono text-[11px] tabular-nums text-muted-foreground/80">
				{shortenAddress(wallet.address)}
			</div>
		</button>
	);
}

function PortfolioEmptyState({
	networkName,
	sampleWallets,
	onSubmitAddress,
}: {
	networkName: string;
	sampleWallets: SampleWallet[];
	onSubmitAddress: (address: string) => void;
}) {
	return (
		<div className="relative z-10 mx-auto w-full max-w-3xl px-6 pt-4 pb-24 md:pt-8">
			{/* Decorative halo */}
			<div
				aria-hidden
				className="-z-10 pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-2xl bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--ring)_18%,transparent),transparent_70%)] blur-2xl"
			/>

			<Empty className="gap-7">
				<EmptyHeader className="gap-4">
					<div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
						<SparklesIcon className="size-3" />
						Wallet inspector
					</div>
					<EmptyTitle className="font-heading text-3xl tracking-tight md:text-4xl">
						Inspect any wallet.
					</EmptyTitle>
					<EmptyDescription className="max-w-md text-balance text-[15px]/6">
						Enter a {networkName} address for balances, DeFi positions, and
						protocol exposure in one view.
					</EmptyDescription>
				</EmptyHeader>

				<EmptyContent className="w-full max-w-xl gap-5">
					<SearchAddressInput onSubmit={onSubmitAddress} />

					<div className="flex items-center gap-3 text-muted-foreground text-xs">
						<Separator className="flex-1" />
						<span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.3em]">
							<TelescopeIcon className="size-3" />
							Try one
						</span>
						<Separator className="flex-1" />
					</div>

					<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
						{sampleWallets.map((wallet) => (
							<SampleWalletCard
								key={wallet.address}
								wallet={wallet}
								onPick={onSubmitAddress}
							/>
						))}
					</div>
				</EmptyContent>
			</Empty>
		</div>
	);
}

function PortfolioLoadingState({
	address,
	state,
}: {
	address: string;
	state: RemotePortfolioState | null;
}) {
	return (
		<div className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-3xl items-center px-6 py-10">
			<div className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-background/48 p-6 shadow-[0_30px_90px_-58px_rgb(0_0_0/0.95)] backdrop-blur-xl md:p-8">
				<div
					aria-hidden
					className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 opacity-45"
				>
					<div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/10 animate-[wallet-pulse_2.4s_ease-in-out_infinite]" />
					<div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/12 animate-[wallet-pulse_2.4s_ease-in-out_0.35s_infinite]" />
					<div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/14 animate-[wallet-pulse_2.4s_ease-in-out_0.7s_infinite]" />
				</div>

				<div className="relative">
					<div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/55 px-3 py-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
						<span className="relative flex size-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
							<span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
						</span>
						Wallet inspector
					</div>
					<h2 className="mt-5 font-heading text-3xl tracking-tight md:text-4xl">
						Preparing portfolio
					</h2>
					<div className="mt-3 max-w-md font-mono text-sm text-muted-foreground tabular-nums">
						{shortenAddress(address)}
					</div>
					<div className="mt-6 h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
						<div className="h-full w-2/3 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-300 animate-[wallet-loading_1.3s_ease-in-out_infinite]" />
					</div>

					{state?.positionError ||
					state?.tokenError ||
					state?.positionTokenError ? (
						<div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/8 px-3 py-2 font-mono text-[11px] text-rose-600 dark:text-rose-400">
							{state.positionError ??
								state.tokenError ??
								state.positionTokenError}
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

type WalletPlotState = {
	address: string;
	bucket: TrackallSolanaPortfolioPlotBucket;
	loading: boolean;
	error: string | null;
	plot: TrackallSolanaPortfolioPlot | null;
};

function formatPlotLabel(
	timestamp: string,
	bucket: TrackallSolanaPortfolioPlotBucket,
) {
	const date = new Date(timestamp);
	if (!Number.isFinite(date.getTime())) return timestamp;
	if (bucket === "1d") {
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	}
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

function walletPlotDelta(points: TrackallSolanaPortfolioPlotPoint[]) {
	const first = points[0];
	const last = points[points.length - 1];
	if (!first || !last) return null;
	const delta = last.totalUsd - first.totalUsd;
	return {
		delta,
		pct: first.totalUsd > 0 ? (delta / first.totalUsd) * 100 : 0,
	};
}

function walletPlotSkeletonData(fallbackValue: number) {
	const base =
		Number.isFinite(fallbackValue) && fallbackValue > 0 ? fallbackValue : 100;
	return [
		{ label: "Start", positions: 0, value: base * 0.58 },
		{ label: "", positions: 0, value: base * 0.74 },
		{ label: "Loading plot", positions: 0, value: base * 0.64 },
		{ label: "", positions: 0, value: base * 0.82 },
		{ label: "Now", positions: 0, value: base * 0.7 },
	];
}

function WalletValueChart({
	bucket,
	error,
	fallbackValue,
	fallbackWhenEmpty,
	loading,
	negative,
	points,
}: {
	bucket: TrackallSolanaPortfolioPlotBucket;
	error: string | null;
	fallbackValue: number;
	fallbackWhenEmpty: boolean;
	loading: boolean;
	negative: boolean;
	points: TrackallSolanaPortfolioPlotPoint[];
}) {
	const reactId = useId();
	const gradientId = `wallet-plot-${reactId.replace(/:/g, "")}`;
	const strokeColor = negative ? "var(--color-rose-500)" : "var(--chart-2)";
	const useFallbackPoint =
		fallbackWhenEmpty && points.length === 0 && Number.isFinite(fallbackValue);
	const chartData = useMemo(() => {
		if (useFallbackPoint) {
			return [
				{
					label: "Current",
					positions: 0,
					value: fallbackValue,
				},
			];
		}

		return points.map((point) => ({
			label: formatPlotLabel(point.timestamp, bucket),
			positions: point.positionCount,
			value: point.totalUsd,
		}));
	}, [bucket, fallbackValue, points, useFallbackPoint]);
	const skeletonData = useMemo(
		() => walletPlotSkeletonData(fallbackValue),
		[fallbackValue],
	);
	const showingSkeleton = loading && chartData.length === 0;
	const showingStaleData = loading && chartData.length > 0;
	const displayData = showingSkeleton ? skeletonData : chartData;
	const tickInterval =
		bucket === "1d" && displayData.length > 18
			? Math.ceil(displayData.length / 4)
			: 0;
	const xAxisTicks = useMemo(() => {
		if (showingSkeleton) return ["Start", "Loading plot", "Now"];
		if (bucket === "1d" || chartData.length <= 3) return undefined;
		const middleIndex = Math.floor((chartData.length - 1) / 2);
		return [
			chartData[0]?.label,
			chartData[middleIndex]?.label,
			chartData[chartData.length - 1]?.label,
		].filter((label): label is string => Boolean(label));
	}, [bucket, chartData, showingSkeleton]);
	const visibleXTickCount =
		xAxisTicks?.length ?? Math.min(displayData.length, 5);
	const renderXAxisTick = useCallback(
		({
			x = 0,
			y = 0,
			payload,
			index = 0,
		}: {
			x?: number | string;
			y?: number | string;
			payload?: { value?: string | number };
			index?: number;
		}) => {
			const tickX = Number(x);
			const tickY = Number(y);
			const edgeOffset =
				displayData.length <= 1 || showingSkeleton
					? 0
					: index === 0
						? 42
						: index === visibleXTickCount - 1
							? -42
							: 0;
			return (
				<text
					x={(Number.isFinite(tickX) ? tickX : 0) + edgeOffset}
					y={Number.isFinite(tickY) ? tickY : 0}
					dy={8}
					fill="currentColor"
					fontSize={10}
					letterSpacing={0}
					textAnchor="middle"
				>
					{String(payload?.value ?? "")}
				</text>
			);
		},
		[displayData.length, showingSkeleton, visibleXTickCount],
	);

	if (chartData.length === 0 && !showingSkeleton) {
		return (
			<div className="grid h-[188px] place-items-center rounded-xl border border-border/50 bg-background/35 px-4 text-center">
				<div>
					<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
						{error ? "Plot unavailable" : "No plot data"}
					</div>
					<div className="mt-2 max-w-sm text-sm text-muted-foreground">
						{error ??
							"Portfolio value history will appear here once the API returns points."}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`transition-opacity duration-200 ease-out ${
				showingStaleData ? "opacity-60" : "opacity-100"
			} ${showingSkeleton ? "animate-pulse" : ""}`}
		>
			<Chart.ChartContainer className="h-[188px] [&_.recharts-cartesian-axis-tick_text]:!tracking-normal">
				<AreaChart
					data={displayData}
					margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
				>
					<defs>
						<linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
							<stop
								offset="0%"
								stopColor={strokeColor}
								stopOpacity={showingSkeleton ? 0.16 : 0.5}
							/>
							<stop offset="100%" stopColor={strokeColor} stopOpacity={0.04} />
						</linearGradient>
					</defs>
					<Chart.ChartGrid />
					<XAxis
						dataKey="label"
						interval={tickInterval}
						ticks={xAxisTicks}
						tick={renderXAxisTick}
						tickLine={false}
						axisLine={false}
						tickMargin={10}
						minTickGap={8}
						stroke="currentColor"
					/>
					<YAxis
						width={62}
						tickFormatter={(value) => formatUsdCompact(Number(value))}
						tick={{ fontSize: 10, letterSpacing: 0 }}
						tickLine={false}
						axisLine={false}
						tickMargin={10}
						minTickGap={8}
						stroke="currentColor"
					/>
					<Chart.ChartTooltip />
					<Area
						type="monotone"
						dataKey="value"
						name="Total USD"
						stroke={strokeColor}
						strokeOpacity={showingSkeleton ? 0.4 : 1}
						strokeWidth={2}
						dot={displayData.length === 1 ? { r: 3, strokeWidth: 2 } : false}
						activeDot={showingSkeleton ? false : { r: 4, strokeWidth: 2 }}
						fill={`url(#${gradientId})`}
						isAnimationActive={false}
					/>
				</AreaChart>
			</Chart.ChartContainer>
		</div>
	);
}

function NetWorthAndAllocation({
	networkName,
	onPlotBucketChange,
	portfolio,
	plotBucket,
	plotState,
}: {
	networkName: string;
	onPlotBucketChange: (bucket: TrackallSolanaPortfolioPlotBucket) => void;
	portfolio: PortfolioMock;
	plotBucket: TrackallSolanaPortfolioPlotBucket;
	plotState: WalletPlotState | null;
}) {
	const [allocationKind, setAllocationKind] =
		useState<AllocationKind>("tokens");
	const spotValue = portfolio.tokens.reduce(
		(acc, token) => acc + token.usdValue,
		0,
	);
	const defiValue = portfolio.defiAllocation.reduce(
		(acc, item) => acc + item.usdValue,
		0,
	);
	const totalValue = allocationKind === "tokens" ? spotValue : defiValue;

	const slices =
		allocationKind === "tokens"
			? portfolio.tokens.map((t) => ({
					key: t.tokenId ?? t.symbol,
					logoSrc: t.logoUrl ?? TOKEN_LOGOS[t.symbol],
					name: t.symbol,
					value: t.usdValue,
					color: t.color,
				}))
			: portfolio.defiAllocation.map((a) => ({
					key: a.protocolId,
					logoSrc: a.logoUrl ?? PROTOCOL_LOGOS[a.protocolId],
					name: a.name,
					value: a.usdValue,
					color: a.color,
				}));

	const plotPoints = plotState?.plot?.points ?? [];
	const latestPlotPoint = plotPoints[plotPoints.length - 1];
	const plotChange = walletPlotDelta(plotPoints);
	const displayedNetWorth = latestPlotPoint?.totalUsd ?? portfolio.netWorth;
	const displayedChangeDelta = plotChange?.delta ?? portfolio.netWorthChange24h;
	const displayedChangePct = plotChange?.pct ?? portfolio.netWorthChangePct24h;
	const negative = displayedChangeDelta < 0;
	const changeLabel = plotChange ? "plot" : "today";

	return (
		<div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 shadow-[0_28px_70px_-54px_rgb(0_0_0/0.9)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_340px]">
			<div className="relative min-w-0 overflow-hidden bg-background/58 p-6">
				<div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
					<div>
						<div className="flex items-baseline gap-2">
							<span className="font-heading text-2xl">Wallet</span>
							<span className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								{networkName} holdings
							</span>
						</div>
						<div className="mt-2 flex flex-wrap items-baseline gap-3">
							<span className="font-mono text-5xl tracking-tight tabular-nums">
								${displayedNetWorth.toFixed(2)}
							</span>
							<span
								className={
									"inline-flex items-center gap-0.5 font-mono text-sm leading-none tabular-nums " +
									(negative
										? "text-rose-600 dark:text-rose-400"
										: "text-emerald-600 dark:text-emerald-400")
								}
							>
								{negative ? (
									<ArrowDownRightIcon className="size-4 shrink-0" />
								) : (
									<ArrowUpRightIcon className="size-4 shrink-0" />
								)}
								{formatPct(displayedChangePct)}
							</span>
						</div>
						<div className="mt-1 font-mono text-muted-foreground text-xs tabular-nums">
							{formatUsdDelta(displayedChangeDelta)} {changeLabel} · spot{" "}
							{formatUsdCompact(spotValue)} · DeFi {formatUsdCompact(defiValue)}
						</div>
					</div>
					<Tabs
						value={plotBucket}
						onValueChange={(next) =>
							onPlotBucketChange(next as TrackallSolanaPortfolioPlotBucket)
						}
						className="shrink-0"
					>
						<TabsList aria-label="Chart range">
							{WALLET_PLOT_BUCKETS.map((entry) => (
								<TabsTab key={entry.value} value={entry.value}>
									{entry.label}
								</TabsTab>
							))}
						</TabsList>
					</Tabs>
				</div>

				<div className="relative z-0 mt-7">
					<WalletValueChart
						bucket={plotBucket}
						error={plotState?.error ?? null}
						fallbackValue={portfolio.netWorth}
						fallbackWhenEmpty={Boolean(
							plotState?.plot &&
								!plotState.loading &&
								!plotState.error &&
								plotPoints.length === 0,
						)}
						loading={plotState?.loading ?? false}
						negative={negative}
						points={plotPoints}
					/>
				</div>
			</div>

			<div className="min-w-0 bg-background/58 p-6">
				<div>
					<div>
						<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
							{allocationKind === "tokens"
								? "Token allocation"
								: "DeFi allocation"}
						</div>
						<div className="mt-2 font-heading text-3xl tabular-nums">
							{formatUsdCompact(totalValue)}
						</div>
						<div className="mt-1 font-mono text-muted-foreground text-xs">
							{allocationKind === "tokens" ? "Spot assets" : "Protocol value"}
						</div>
					</div>
					<Tabs
						value={allocationKind}
						onValueChange={(next) => setAllocationKind(next as AllocationKind)}
						className="mt-4 w-full"
					>
						<TabsList aria-label="Allocation view" className="w-full">
							<TabsTab value="tokens" className="flex-1">
								Tokens
							</TabsTab>
							<TabsTab value="defi" className="flex-1">
								DeFi
							</TabsTab>
						</TabsList>
					</Tabs>
				</div>

				<div className="mt-5 flex h-3 overflow-hidden rounded-full bg-foreground/[0.06]">
					{slices.map((slice) => {
						const share = totalValue > 0 ? (slice.value / totalValue) * 100 : 0;
						return (
							<span
								key={slice.key}
								className="h-full"
								style={{ background: slice.color, width: `${share}%` }}
							/>
						);
					})}
				</div>

				<div className="scrollbar-none mt-4 h-[184px] overflow-y-auto">
					<ul className="space-y-2 font-mono text-[11px]">
						{slices.map((slice) => {
							const share =
								totalValue > 0 ? (slice.value / totalValue) * 100 : 0;
							return (
								<li
									key={slice.key}
									className="flex items-center justify-between gap-3"
								>
									<span className="flex min-w-0 items-center gap-2">
										<span
											className="size-2 shrink-0 rounded-full"
											style={{ background: slice.color }}
										/>
										<span className="truncate">{slice.name}</span>
									</span>
									<span className="shrink-0 text-muted-foreground tabular-nums">
										{share.toFixed(2)}%
									</span>
								</li>
							);
						})}
					</ul>
				</div>

				<div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border/50">
					<div className="bg-background/72 p-3">
						<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
							Net worth
						</div>
						<div className="mt-1 font-mono text-sm tabular-nums">
							${displayedNetWorth.toFixed(2)}
						</div>
					</div>
					<div className="bg-background/72 p-3">
						<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
							{plotChange ? "Plot delta" : "24H change"}
						</div>
						<div
							className={
								"mt-1 font-mono text-sm tabular-nums " +
								(negative
									? "text-rose-600 dark:text-rose-400"
									: "text-emerald-600 dark:text-emerald-400")
							}
						>
							{formatPct(displayedChangePct)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function PortfolioStripCard({
	children,
	logo,
	onClick,
	selected,
	ariaPressed,
	ariaLabel,
}: {
	children: ReactNode;
	logo: ReactNode;
	onClick?: () => void;
	selected?: boolean;
	ariaPressed?: boolean;
	ariaLabel?: string;
}) {
	const className =
		"group relative flex h-[84px] min-w-[200px] shrink-0 flex-row items-center gap-3 overflow-hidden border-border/60 bg-background/40 px-3 text-left shadow-[0_14px_34px_-28px_rgb(0_0_0/0.85)] backdrop-blur-xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out will-change-transform hover:border-border hover:bg-background/52 hover:shadow-[0_16px_40px_-30px_rgb(0_0_0/0.92)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 dark:before:transition-[box-shadow] dark:before:duration-200" +
		(selected
			? " -translate-y-0.5 border-border bg-background/55 shadow-[inset_0_-1px_0_0_rgb(255_255_255/0.10),0_22px_45px_-22px_rgb(255_255_255/0.20)] dark:before:shadow-none"
			: "") +
		(onClick ? " cursor-pointer" : "");

	if (onClick) {
		return (
			<Card
				className={className}
				render={
					<button
						type="button"
						onClick={onClick}
						aria-pressed={ariaPressed}
						aria-label={ariaLabel}
					/>
				}
			>
				<div className="relative shrink-0">{logo}</div>
				<div className="relative min-w-0">{children}</div>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<div className="relative shrink-0">{logo}</div>
			<div className="relative min-w-0">{children}</div>
		</Card>
	);
}

function ProtocolStripRow({
	networkSymbol,
	portfolio,
	selectedProtocolIds,
	onToggleProtocol,
	onClearSelection,
}: {
	networkSymbol: string;
	portfolio: PortfolioMock;
	selectedProtocolIds: Set<string>;
	onToggleProtocol: (protocolId: string) => void;
	onClearSelection: () => void;
}) {
	const hasSelection = selectedProtocolIds.size > 0;
	return (
		<div className="scrollbar-none -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
			<PortfolioStripCard
				onClick={hasSelection ? onClearSelection : undefined}
				ariaLabel="Show all positions"
				logo={
					<TokenLogo
						symbol={networkSymbol}
						shape="square"
						className="size-11 rounded-xl"
					/>
				}
			>
				<div className="truncate font-mono text-[11px] text-foreground uppercase tracking-[0.18em]">
					Holdings
				</div>
				<div className="mt-1 font-mono text-[13px] text-muted-foreground tabular-nums">
					{formatUsdCompact(portfolio.holdingsTotal)}
				</div>
			</PortfolioStripCard>
			{portfolio.defiPositions.map((p) => {
				const isSelected = selectedProtocolIds.has(p.protocolId);
				return (
					<PortfolioStripCard
						key={p.protocolId}
						onClick={() => onToggleProtocol(p.protocolId)}
						selected={isSelected}
						ariaPressed={isSelected}
						logo={
							<ProtocolLogo
								color={
									portfolio.defiAllocation.find(
										(a) => a.protocolId === p.protocolId,
									)?.color
								}
								protocolId={p.protocolId}
								protocolName={p.protocolName}
								logoUrl={p.protocolLogo}
								shape="square"
								className="size-11 rounded-xl"
							/>
						}
					>
						<div className="flex items-center gap-1 truncate font-mono text-[11px] text-foreground uppercase tracking-[0.18em]">
							<span className="truncate">{p.protocolName}</span>
							<a
								href={p.protocolHref}
								target="_blank"
								rel="noreferrer"
								className="text-muted-foreground opacity-70 transition-[color,opacity,transform] hover:text-foreground group-hover:opacity-100"
								onClick={(e) => e.stopPropagation()}
							>
								<ExternalLinkIcon className="size-3" />
							</a>
						</div>
						<div className="font-mono text-[11px] text-muted-foreground tabular-nums">
							{formatUsdCompact(p.totalValue)}
						</div>
					</PortfolioStripCard>
				);
			})}
		</div>
	);
}

function PortfolioShareBar({ value }: { value: number }) {
	const width = Math.min(100, Math.max(0, value));

	return (
		<div className="flex items-center gap-2">
			<div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted/70">
				<div
					className="h-full rounded-full bg-foreground/70 transition-[width] duration-500"
					style={{ width: `${width}%` }}
				/>
			</div>
			<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
				{value.toFixed(1)}%
			</span>
		</div>
	);
}

function PortfolioDeltaPill({ value }: { value: number }) {
	const negative = value < 0;

	return (
		<span
			className={
				"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] leading-none tabular-nums " +
				(negative
					? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
					: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")
			}
		>
			{negative ? (
				<ArrowDownRightIcon className="size-3 shrink-0" />
			) : (
				<ArrowUpRightIcon className="size-3 shrink-0" />
			)}
			{formatPct(value)}
		</span>
	);
}

function HoldingsSection({ portfolio }: { portfolio: PortfolioMock }) {
	const spotTotal = portfolio.tokens.reduce(
		(acc, token) => acc + token.usdValue,
		0,
	);

	return (
		<section className="overflow-hidden rounded-xl border border-border/60 bg-background/40">
			<header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
				<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
					Holdings
				</div>
				<span className="inline-flex h-6 items-center rounded-full border border-border/60 bg-muted/35 px-2.5 font-mono text-[11px] text-muted-foreground tabular-nums">
					{portfolio.tokens.length} assets
				</span>
			</header>
			<div className="scrollbar-none overflow-x-auto">
				<Table className="min-w-[900px]">
					<TableHeader className="[&_tr]:border-border/60">
						<TableRow>
							<TableHead className="text-xs font-medium text-muted-foreground">
								Asset
							</TableHead>
							<TableHead className="text-xs font-medium text-muted-foreground">
								Balance
							</TableHead>
							<TableHead className="text-right text-xs font-medium text-muted-foreground">
								USD Value
							</TableHead>
							<TableHead className="text-right text-xs font-medium text-muted-foreground">
								Token price
							</TableHead>
							<TableHead className="text-xs font-medium text-muted-foreground">
								Wallet share
							</TableHead>
							<TableHead className="text-right text-xs font-medium text-muted-foreground">
								24h
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="[&_tr]:border-border/60">
						{portfolio.tokens.map((token) => (
							<TableRow
								key={token.tokenId ?? token.symbol}
								className="transition-colors hover:bg-muted/40"
							>
								<TableCell>
									<div className="flex items-center gap-3">
										<TokenLogo
											symbol={token.symbol}
											color={token.color}
											logoUrl={token.logoUrl}
											className="size-9"
										/>
										<div className="min-w-0">
											<div className="truncate text-sm font-medium">
												{token.name}
											</div>
											<div className="mt-0.5 flex items-center gap-1.5">
												<Badge
													variant="outline"
													className="h-4 px-1 font-mono text-[9px]"
												>
													Token
												</Badge>
												<span className="font-mono text-[10px] text-muted-foreground">
													{token.symbol}
												</span>
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell className="font-mono text-sm text-muted-foreground tabular-nums">
									{token.balanceLabel}
								</TableCell>
								<TableCell className="text-right font-mono tabular-nums">
									{formatUsd(token.usdValue)}
								</TableCell>
								<TableCell className="text-right font-mono text-muted-foreground tabular-nums">
									{formatUsd(token.price)}
								</TableCell>
								<TableCell>
									<PortfolioShareBar
										value={
											spotTotal > 0 ? (token.usdValue / spotTotal) * 100 : 0
										}
									/>
								</TableCell>
								<TableCell className="text-right">
									<PortfolioDeltaPill value={token.usdValueChangePct24h} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</section>
	);
}

type DefiGroupItem =
	| { kind: "single"; group: DefiPositionGroup }
	| {
			kind: "pair";
			pairKey: string;
			supplied: DefiPositionGroup;
			borrowed: DefiPositionGroup;
	  };

function foldGroupPairs(groups: DefiPositionGroup[]): DefiGroupItem[] {
	const items: DefiGroupItem[] = [];
	const consumed = new Set<number>();
	for (let index = 0; index < groups.length; index += 1) {
		if (consumed.has(index)) continue;
		const group = groups[index];
		if (group.pairKey) {
			const partnerIndex = groups.findIndex(
				(candidate, candidateIndex) =>
					candidateIndex !== index &&
					!consumed.has(candidateIndex) &&
					candidate.pairKey === group.pairKey,
			);
			if (partnerIndex !== -1) {
				const partner = groups[partnerIndex];
				const supplied =
					group.kind === DefiGroupKind.Supplied ? group : partner;
				const borrowed =
					group.kind === DefiGroupKind.Borrowing ? group : partner;
				consumed.add(partnerIndex);
				items.push({
					kind: "pair",
					pairKey: group.pairKey,
					supplied,
					borrowed,
				});
				continue;
			}
		}
		items.push({ kind: "single", group });
	}
	return items;
}

function DefiGroupHeader({
	group,
	compact = false,
}: {
	group: DefiPositionGroup;
	compact?: boolean;
}) {
	return (
		<div
			className={
				"flex flex-wrap items-center justify-between gap-2 px-4 " +
				(compact ? "py-2" : "border-b border-border/50 py-3")
			}
		>
			<div className="flex flex-wrap items-center gap-2">
				<Badge variant="outline" className={defiKindClasses(group.kind)}>
					{group.kind}
				</Badge>
				{compact ? null : <AddressChip address={group.walletShort} />}
			</div>
			<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
				{formatUsd(group.value)}
			</span>
		</div>
	);
}

function DefiGroupRowTable({ rows }: { rows: DefiPositionGroup["rows"] }) {
	return (
		<Table>
			<TableHeader className="[&_tr]:border-border/50">
				<TableRow>
					<TableHead className="ps-4 text-xs font-medium text-muted-foreground">
						Position
					</TableHead>
					<TableHead className="text-xs font-medium text-muted-foreground">
						Balance
					</TableHead>
					<TableHead className="text-right text-xs font-medium text-muted-foreground">
						USD Value
					</TableHead>
					<TableHead className="pe-4 text-right text-xs font-medium text-muted-foreground">
						Yield
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody className="[&_tr]:border-border/50">
				{rows.map((row, rowIndex) => (
					<TableRow
						key={`${row.asset}-${rowIndex}`}
						className="hover:bg-muted/40"
					>
						<TableCell className="ps-4 font-medium text-sm">
							<div className="flex items-center gap-3">
								{row.tokens && row.tokens.length > 1 ? (
									<div className="flex items-center -space-x-2">
										{row.tokens.map((token) => (
											<TokenLogo
												key={`${token.symbol}-${token.logoUrl ?? ""}`}
												symbol={token.symbol}
												logoUrl={token.logoUrl}
												className="size-8 ring-2 ring-background"
											/>
										))}
									</div>
								) : (
									<TokenLogo
										symbol={assetPrimarySymbol(row.asset)}
										logoUrl={row.logoUrl ?? row.tokens?.[0]?.logoUrl}
										className="size-8"
									/>
								)}
								<div className="min-w-0">
									<div className="truncate">{row.asset}</div>
								</div>
							</div>
						</TableCell>
						<TableCell className="font-mono text-sm text-muted-foreground tabular-nums">
							{row.balanceLines && row.balanceLines.length > 0 ? (
								row.balanceLines.map((line) => <div key={line}>{line}</div>)
							) : (
								<div>{row.balance}</div>
							)}
							{row.altBalance ? (
								<div className="text-[11px] opacity-80">{row.altBalance}</div>
							) : null}
						</TableCell>
						<TableCell className="text-right font-mono tabular-nums">
							<div className="text-sm">{formatUsd(row.usd)}</div>
							<div
								className={
									"text-[11px] " +
									deltaColorClasses(row.usdChange24h || row.usdChangePct24h)
								}
							>
								{formatUsdDelta(row.usdChange24h)} (
								{formatPct(row.usdChangePct24h)})
							</div>
						</TableCell>
						<TableCell
							className={
								"pe-4 text-right font-mono text-sm tabular-nums " +
								(row.yieldNegative
									? "text-rose-600 dark:text-rose-400"
									: "text-muted-foreground")
							}
						>
							{row.yieldLabel ?? "—"}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function DefiPositionsSection({ portfolio }: { portfolio: PortfolioMock }) {
	const allProtocolIds = useMemo(
		() => portfolio.defiPositions.map((p) => p.protocolId),
		[portfolio],
	);

	return (
		<section className="overflow-hidden rounded-xl border border-border/60 bg-background/40">
			<header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
				<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
					DeFi positions
				</div>
				<span className="inline-flex h-6 items-center rounded-full border border-border/60 bg-muted/35 px-2.5 font-mono text-[11px] text-muted-foreground tabular-nums">
					{portfolio.defiPositions.length} protocols
				</span>
			</header>
			<div className="scrollbar-none overflow-x-auto">
				<div className="min-w-[900px]">
					<div className="grid grid-cols-[minmax(260px,1.3fr)_minmax(140px,0.65fr)_minmax(220px,1fr)_minmax(150px,0.7fr)_minmax(100px,0.5fr)_40px] items-center border-b border-border/60 px-5 py-3 text-xs font-medium text-muted-foreground">
						<div>Protocol</div>
						<div className="text-right">Value</div>
						<div />
						<div>Wallet</div>
						<div className="text-right">Assets</div>
						<div />
					</div>
					<Accordion
						key={allProtocolIds.join("|")}
						multiple
						defaultValue={allProtocolIds}
					>
						{portfolio.defiPositions.map((protocol) => {
							const color = portfolio.defiAllocation.find(
								(a) => a.protocolId === protocol.protocolId,
							)?.color;
							const rowCount = protocol.groups.reduce(
								(acc, group) => acc + group.rows.length,
								0,
							);
							const kinds = Array.from(
								new Set(
									protocol.groups.map((group) =>
										group.pairKey &&
										(group.kind === DefiGroupKind.Supplied ||
											group.kind === DefiGroupKind.Borrowing)
											? DefiGroupKind.Lending
											: group.kind,
									),
								),
							);
							const wallets = Array.from(
								new Set(protocol.groups.map((group) => group.walletShort)),
							);
							const claimableTotal =
								protocol.claimSummary.feesUsd +
								protocol.claimSummary.rewardsUsd;

							return (
								<AccordionItem
									key={protocol.protocolId}
									value={protocol.protocolId}
									className="border-border/60"
								>
									<AccordionTrigger className="items-center rounded-none px-5 py-3 hover:bg-muted/40 [&_[data-slot=accordion-indicator]]:translate-y-0">
										<div className="grid flex-1 grid-cols-[minmax(260px,1.3fr)_minmax(140px,0.65fr)_minmax(220px,1fr)_minmax(150px,0.7fr)_minmax(100px,0.5fr)] items-center gap-4">
											<div className="flex min-w-0 items-center gap-3">
												<ProtocolLogo
													color={color}
													protocolId={protocol.protocolId}
													protocolName={protocol.protocolName}
													logoUrl={protocol.protocolLogo}
													className="size-9"
												/>
												<div className="min-w-0">
													<div className="flex items-center gap-2">
														<span className="truncate text-sm font-medium">
															{protocol.protocolName}
														</span>
														<span className="text-muted-foreground">
															<ExternalLinkIcon className="size-3" />
														</span>
													</div>
													<div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
														{protocol.protocolId}
													</div>
												</div>
											</div>
											<div className="flex flex-col items-end gap-1 text-right font-mono tabular-nums">
												<span>{formatUsdCompact(protocol.totalValue)}</span>
												{claimableTotal > 0 ? (
													<Badge
														variant="outline"
														className="h-5 px-1.5 text-[10px] text-muted-foreground tabular-nums"
													>
														Claimable {formatUsd(claimableTotal)}
													</Badge>
												) : null}
											</div>
											<div className="flex min-w-0 flex-wrap gap-1.5">
												{kinds.map((kind) => (
													<Badge
														key={kind}
														variant="outline"
														className={defiKindClasses(kind)}
													>
														{kind}
													</Badge>
												))}
											</div>
											<div className="flex min-w-0">
												<AddressChip
													address={wallets[0] ?? "—"}
													copyable={false}
												/>
											</div>
											<div className="flex justify-end">
												<span className="inline-flex h-6 items-center rounded-full border border-border/60 bg-muted/35 px-2.5 font-mono text-[11px] text-muted-foreground tabular-nums">
													{rowCount} assets
												</span>
											</div>
										</div>
									</AccordionTrigger>
									<AccordionPanel className="px-5 pb-4">
										<div className="space-y-4">
											{foldGroupPairs(protocol.groups).map(
												(item, itemIndex) => {
													const itemKey = `${protocol.protocolId}:${itemIndex}`;
													if (item.kind === "single") {
														return (
															<div
																key={itemKey}
																className="overflow-hidden rounded-xl border border-border/50 bg-background/35"
															>
																<DefiGroupHeader group={item.group} />
																<DefiGroupRowTable rows={item.group.rows} />
															</div>
														);
													}
													const net = item.supplied.value - item.borrowed.value;
													return (
														<div
															key={itemKey}
															className="overflow-hidden rounded-xl border border-border/50 bg-background/35"
														>
															<div className="flex flex-wrap items-center justify-between gap-2 border-border/50 border-b px-4 py-3">
																<AddressChip
																	address={item.supplied.walletShort}
																/>
																<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
																	Net {formatUsd(net)}
																</span>
															</div>
															<div className="divide-y divide-border/40">
																<div>
																	<DefiGroupHeader
																		group={item.supplied}
																		compact
																	/>
																	<DefiGroupRowTable
																		rows={item.supplied.rows}
																	/>
																</div>
																<div>
																	<DefiGroupHeader
																		group={item.borrowed}
																		compact
																	/>
																	<DefiGroupRowTable
																		rows={item.borrowed.rows}
																	/>
																</div>
															</div>
														</div>
													);
												},
											)}
										</div>
									</AccordionPanel>
								</AccordionItem>
							);
						})}
					</Accordion>
				</div>
			</div>
		</section>
	);
}

type RemotePortfolioState = {
	address: string;
	cacheLoaded: boolean;
	cachePositions: TrackallSolanaPosition[];
	cachedAt: number | null;
	liveLoaded: boolean;
	livePositions: TrackallSolanaPosition[];
	loadingCache: boolean;
	loadingLive: boolean;
	loadingPositionTokens: boolean;
	loadingTokens: boolean;
	positionTokenError: string | null;
	positionTokens: TrackallSolanaToken[];
	positionTokensLoaded: boolean;
	positionError: string | null;
	tokenError: string | null;
	tokensLoaded: boolean;
	tokens: TrackallSolanaToken[];
};

const REMOTE_PORTFOLIO_STATE_BY_ADDRESS = new Map<
	string,
	RemotePortfolioState
>();
const REMOTE_PORTFOLIO_PLOT_STATE_BY_KEY = new Map<string, WalletPlotState>();

function walletPlotCacheKey(
	address: string,
	bucket: TrackallSolanaPortfolioPlotBucket,
) {
	return `${address}:${bucket}`;
}

function publishedPositions(state: RemotePortfolioState | null) {
	if (!state || !portfolioDataReady(state)) return [];
	return state.liveLoaded ? state.livePositions : state.cachePositions;
}

function portfolioPositionsReady(state: RemotePortfolioState | null) {
	return Boolean(state?.cacheLoaded || state?.liveLoaded);
}

function portfolioDataReady(state: RemotePortfolioState | null) {
	return Boolean(portfolioPositionsReady(state) && state?.tokensLoaded);
}

function portfolioMetadataReady(state: RemotePortfolioState | null) {
	return Boolean(state?.positionTokensLoaded);
}

function errorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Request failed";
}

function positionLegGroups(
	position: TrackallSolanaPosition,
): ReadonlyArray<readonly { amount?: { token: string } }[] | undefined> {
	switch (position.positionKind) {
		case "lending":
			return [position.supplied, position.borrowed, position.rewards];
		case "staking":
			return [position.staked, position.unbonding, position.rewards];
		case "liquidity":
			return [position.poolTokens, position.fees, position.rewards];
		case "reward":
			return [position.claimable, position.claimed, position.rewards];
		case "vesting":
			return [
				position.vesting,
				position.claimable,
				position.claimed,
				position.rewards,
			];
		case "trading":
			return [position.deposited, position.rewards];
	}
}

function positionTokenMints(positions: TrackallSolanaPosition[]) {
	const mints = new Set<string>();
	for (const position of positions) {
		for (const legs of positionLegGroups(position)) {
			for (const leg of legs ?? []) {
				const mint = leg.amount?.token?.trim();
				if (mint) mints.add(mint);
			}
		}
	}
	return [...mints];
}

function missingPositionTokenMints(
	positions: TrackallSolanaPosition[],
	knownTokens: TrackallSolanaToken[],
) {
	const knownMints = new Set(knownTokens.map((token) => token.mintAddress));
	return positionTokenMints(positions).filter((mint) => !knownMints.has(mint));
}

function firstString(...values: Array<string | undefined>) {
	return values.find((value) => value?.trim())?.trim();
}

function mergeTokensWithMetadata(
	tokens: TrackallSolanaToken[],
	metadata: TrackallSolanaToken[],
) {
	const byMint = new Map<string, TrackallSolanaToken>();
	for (const token of metadata) {
		byMint.set(token.mintAddress, token);
	}

	for (const token of tokens) {
		const metadataToken = byMint.get(token.mintAddress);
		byMint.set(
			token.mintAddress,
			metadataToken
				? {
						...metadataToken,
						...token,
						decimals: token.decimals ?? metadataToken.decimals,
						image: firstString(token.image, metadataToken.image),
						name: firstString(token.name, metadataToken.name),
						pctPriceChange24h:
							token.pctPriceChange24h ?? metadataToken.pctPriceChange24h,
						priceUsd: token.priceUsd ?? metadataToken.priceUsd,
						symbol: firstString(token.symbol, metadataToken.symbol),
					}
				: token,
		);
	}

	return [...byMint.values()];
}

export function PortfolioPage({
	activeNetworkFilter,
	protocols,
	walletAddress,
	onClearWallet,
	onOpenWallet,
}: {
	activeNetworkFilter: Network | null;
	protocols: Protocol[];
	walletAddress: string | null;
	onClearWallet: () => void;
	onOpenWallet: (address: string) => void;
}) {
	const [pendingWalletAddress, setPendingWalletAddress] = useState<
		string | null
	>(null);
	const [plotBucket, setPlotBucket] =
		useState<TrackallSolanaPortfolioPlotBucket>(DEFAULT_WALLET_PLOT_BUCKET);
	const [selectedProtocolIds, setSelectedProtocolIds] = useState<Set<string>>(
		() => new Set(),
	);
	const loadWalletAddress = pendingWalletAddress ?? walletAddress;
	const shouldLoadSolanaWallet = Boolean(
		loadWalletAddress &&
			(!activeNetworkFilter || activeNetworkFilter.id === "solana"),
	);
	const [remotePortfolio, setRemotePortfolioState] =
		useState<RemotePortfolioState | null>(() => {
			return walletAddress
				? (REMOTE_PORTFOLIO_STATE_BY_ADDRESS.get(walletAddress) ?? null)
				: null;
		});
	const [walletPlotState, setWalletPlotState] =
		useState<WalletPlotState | null>(() => {
			return walletAddress
				? (REMOTE_PORTFOLIO_PLOT_STATE_BY_KEY.get(
						walletPlotCacheKey(walletAddress, DEFAULT_WALLET_PLOT_BUCKET),
					) ?? null)
				: null;
		});
	const setRemotePortfolio = useCallback(
		(
			next:
				| RemotePortfolioState
				| null
				| ((
						current: RemotePortfolioState | null,
				  ) => RemotePortfolioState | null),
		) => {
			setRemotePortfolioState((current) => {
				const resolved = typeof next === "function" ? next(current) : next;
				if (resolved) {
					REMOTE_PORTFOLIO_STATE_BY_ADDRESS.set(resolved.address, resolved);
				}
				return resolved;
			});
		},
		[],
	);
	const setWalletPlot = useCallback(
		(
			next:
				| WalletPlotState
				| null
				| ((current: WalletPlotState | null) => WalletPlotState | null),
		) => {
			setWalletPlotState((current) => {
				const resolved = typeof next === "function" ? next(current) : next;
				if (resolved) {
					REMOTE_PORTFOLIO_PLOT_STATE_BY_KEY.set(
						walletPlotCacheKey(resolved.address, resolved.bucket),
						resolved,
					);
				}
				return resolved;
			});
		},
		[],
	);
	const fallbackPortfolio = getPortfolioMockForNetwork(activeNetworkFilter?.id);
	const networkName = activeNetworkFilter?.name ?? "Solana";
	const networkSymbol = activeNetworkFilter?.symbol ?? "SOL";
	const sampleWallets = sampleWalletsForNetwork(activeNetworkFilter);
	const portfolio = useMemo(() => {
		if (!shouldLoadSolanaWallet || !walletAddress) return fallbackPortfolio;
		const current =
			remotePortfolio?.address === walletAddress ? remotePortfolio : null;
		const tokens = current?.tokensLoaded
			? mergeTokensWithMetadata(current.tokens, current.positionTokens)
			: [];
		return mapTrackallPortfolioToViewModel({
			positions: publishedPositions(current),
			protocols,
			tokens,
			walletAddress,
		});
	}, [
		fallbackPortfolio,
		protocols,
		remotePortfolio,
		shouldLoadSolanaWallet,
		walletAddress,
	]);
	const hasProtocolSelection = selectedProtocolIds.size > 0;
	const filteredDefiPositions = useMemo(() => {
		if (!hasProtocolSelection) return portfolio.defiPositions;
		return portfolio.defiPositions.filter((p) =>
			selectedProtocolIds.has(p.protocolId),
		);
	}, [hasProtocolSelection, portfolio.defiPositions, selectedProtocolIds]);
	const positionsPortfolio = useMemo(
		() =>
			hasProtocolSelection
				? { ...portfolio, defiPositions: filteredDefiPositions }
				: portfolio,
		[filteredDefiPositions, hasProtocolSelection, portfolio],
	);
	const portfolioStatus =
		remotePortfolio?.address === walletAddress ? remotePortfolio : null;
	const pendingPortfolioStatus =
		remotePortfolio?.address === pendingWalletAddress ? remotePortfolio : null;
	const activeAddressStatus =
		remotePortfolio?.address === loadWalletAddress ? remotePortfolio : null;
	const activePlotStatus =
		walletPlotState?.address === walletAddress ? walletPlotState : null;
	const shouldShowLoading =
		Boolean(loadWalletAddress) &&
		shouldLoadSolanaWallet &&
		(!walletAddress || !portfolioDataReady(portfolioStatus));
	const handleSubmit = useCallback((next: string) => {
		setPendingWalletAddress(next);
	}, []);
	const toggleProtocolSelection = useCallback((protocolId: string) => {
		setSelectedProtocolIds((prev) => {
			const next = new Set(prev);
			if (next.has(protocolId)) next.delete(protocolId);
			else next.add(protocolId);
			return next;
		});
	}, []);
	const clearProtocolSelection = useCallback(() => {
		setSelectedProtocolIds((prev) => (prev.size === 0 ? prev : new Set()));
	}, []);

	useEffect(() => {
		setSelectedProtocolIds((prev) => (prev.size === 0 ? prev : new Set()));
	}, [loadWalletAddress]);

	useEffect(() => {
		if (!loadWalletAddress || !shouldLoadSolanaWallet) {
			setRemotePortfolio(null);
			return;
		}

		const cachedState =
			REMOTE_PORTFOLIO_STATE_BY_ADDRESS.get(loadWalletAddress);
		if (
			cachedState &&
			portfolioDataReady(cachedState) &&
			portfolioMetadataReady(cachedState)
		) {
			setRemotePortfolio(cachedState);
			return;
		}

		const controller = new AbortController();
		const config = {
			apiKey: import.meta.env.VITE_TRACKALL_API_KEY,
			baseUrl: import.meta.env.VITE_TRACKALL_API_URL,
		};
		const initialState: RemotePortfolioState = cachedState
			? {
					...cachedState,
					loadingCache: !cachedState.cacheLoaded,
					loadingLive: !cachedState.liveLoaded,
					loadingPositionTokens: !cachedState.positionTokensLoaded,
					loadingTokens: !cachedState.tokensLoaded,
				}
			: {
					address: loadWalletAddress,
					cacheLoaded: false,
					cachePositions: [],
					cachedAt: null,
					liveLoaded: false,
					livePositions: [],
					loadingCache: true,
					loadingLive: true,
					loadingPositionTokens: true,
					loadingTokens: true,
					positionTokenError: null,
					positionTokens: [],
					positionTokensLoaded: false,
					positionError: null,
					tokenError: null,
					tokensLoaded: false,
					tokens: [],
				};

		setRemotePortfolio(initialState);

		const cachePromise = cachedState?.cacheLoaded
			? Promise.resolve({
					address: loadWalletAddress,
					cachedAt: cachedState.cachedAt,
					positions: cachedState.cachePositions,
				})
			: fetchSolanaPositionCache(loadWalletAddress, config, controller.signal);
		const livePromise = cachedState?.liveLoaded
			? Promise.resolve(cachedState.livePositions)
			: fetchSolanaPositions(loadWalletAddress, config, controller.signal);
		const tokensPromise = cachedState?.tokensLoaded
			? Promise.resolve(cachedState.tokens)
			: fetchSolanaTokens(loadWalletAddress, config, controller.signal);

		cachePromise
			.then((cache) => {
				setRemotePortfolio((current) => {
					if (!current || current.address !== loadWalletAddress) return current;
					return {
						...current,
						cacheLoaded: true,
						cachePositions: cache.positions,
						cachedAt: cache.cachedAt,
						loadingCache: false,
						positionError: null,
					};
				});
			})
			.catch((error) => {
				if (controller.signal.aborted) return;
				setRemotePortfolio((current) =>
					current?.address === loadWalletAddress
						? {
								...current,
								loadingCache: false,
								loadingPositionTokens: false,
							}
						: current,
				);
			});

		const cachePositionTokensPromise = Promise.all([
			cachePromise.catch(() => null),
			tokensPromise,
		])
			.then(([cache, tokens]) => {
				if (cache === null) {
					setRemotePortfolio((current) =>
						current?.address === loadWalletAddress
							? {
									...current,
									loadingPositionTokens: false,
									positionTokenError: null,
									positionTokensLoaded: true,
								}
							: current,
					);
					return [];
				}

				const mints = missingPositionTokenMints(cache.positions, tokens);
				if (mints.length === 0) {
					setRemotePortfolio((current) =>
						current?.address === loadWalletAddress
							? {
									...current,
									loadingPositionTokens: false,
									positionTokenError: null,
									positionTokens: [],
									positionTokensLoaded: true,
								}
							: current,
					);
					return [];
				}

				return fetchSolanaTokenMetadata(mints, config, controller.signal).then(
					(positionTokens) => {
						setRemotePortfolio((current) =>
							current?.address === loadWalletAddress
								? {
										...current,
										loadingPositionTokens: false,
										positionTokenError: null,
										positionTokens,
										positionTokensLoaded: true,
									}
								: current,
						);
						return positionTokens;
					},
				);
			})
			.catch((error) => {
				if (!controller.signal.aborted) {
					setRemotePortfolio((current) =>
						current?.address === loadWalletAddress
							? {
									...current,
									loadingPositionTokens: false,
									positionTokenError: errorMessage(error),
									positionTokensLoaded: true,
								}
							: current,
					);
				}
				return [];
			});

		livePromise
			.then((positions) => {
				setRemotePortfolio((current) =>
					current?.address === loadWalletAddress
						? {
								...current,
								liveLoaded: true,
								livePositions: positions,
								loadingLive: false,
								positionError: null,
							}
						: current,
				);
			})
			.catch((error) => {
				if (controller.signal.aborted) return;
				setRemotePortfolio((current) =>
					current?.address === loadWalletAddress
						? {
								...current,
								loadingLive: false,
								positionError: errorMessage(error),
							}
						: current,
				);
			});

		Promise.all([livePromise, tokensPromise, cachePositionTokensPromise])
			.then(([positions, tokens, cachePositionTokens]) => {
				const mints = missingPositionTokenMints(positions, [
					...tokens,
					...cachePositionTokens,
				]);
				if (mints.length === 0) return;

				fetchSolanaTokenMetadata(mints, config, controller.signal)
					.then((positionTokens) => {
						setRemotePortfolio((current) => {
							if (!current || current.address !== loadWalletAddress)
								return current;
							return {
								...current,
								positionTokenError: null,
								positionTokens: mergeTokensWithMetadata(
									current.positionTokens,
									positionTokens,
								),
							};
						});
					})
					.catch((error) => {
						if (controller.signal.aborted) return;
						setRemotePortfolio((current) =>
							current?.address === loadWalletAddress
								? { ...current, positionTokenError: errorMessage(error) }
								: current,
						);
					});
			})
			.catch(() => {
				// Individual cache, live, and wallet-token requests already update visible state.
			});

		tokensPromise
			.then((tokens) => {
				setRemotePortfolio((current) =>
					current?.address === loadWalletAddress
						? {
								...current,
								loadingTokens: false,
								tokenError: null,
								tokensLoaded: true,
								tokens,
							}
						: current,
				);
			})
			.catch((error) => {
				if (controller.signal.aborted) return;
				setRemotePortfolio((current) =>
					current?.address === loadWalletAddress
						? {
								...current,
								loadingTokens: false,
								tokenError: errorMessage(error),
							}
						: current,
				);
			});

		return () => {
			controller.abort();
		};
	}, [loadWalletAddress, shouldLoadSolanaWallet]);

	useEffect(() => {
		if (!loadWalletAddress || !shouldLoadSolanaWallet) {
			setWalletPlot(null);
			return;
		}

		const cacheKey = walletPlotCacheKey(loadWalletAddress, plotBucket);
		const cachedState = REMOTE_PORTFOLIO_PLOT_STATE_BY_KEY.get(cacheKey);
		if (cachedState?.plot && !cachedState.error) {
			setWalletPlot(cachedState);
			return;
		}

		const controller = new AbortController();
		const config = {
			apiKey: import.meta.env.VITE_TRACKALL_API_KEY,
			baseUrl: import.meta.env.VITE_TRACKALL_API_URL,
		};
		setWalletPlot((current) => {
			const previousPlot =
				current?.address === loadWalletAddress ? current.plot : null;
			return {
				address: loadWalletAddress,
				bucket: plotBucket,
				error: null,
				loading: true,
				plot: cachedState?.plot ?? previousPlot ?? null,
			};
		});

		fetchSolanaPortfolioPlot(
			loadWalletAddress,
			plotBucket,
			config,
			controller.signal,
		)
			.then((plot) => {
				setWalletPlot((current) =>
					current?.address === loadWalletAddress &&
					current.bucket === plotBucket
						? {
								...current,
								error: null,
								loading: false,
								plot,
							}
						: current,
				);
			})
			.catch((error) => {
				if (controller.signal.aborted) return;
				setWalletPlot((current) =>
					current?.address === loadWalletAddress &&
					current.bucket === plotBucket
						? {
								...current,
								error: errorMessage(error),
								loading: false,
							}
						: current,
				);
			});

		return () => {
			controller.abort();
		};
	}, [loadWalletAddress, plotBucket, setWalletPlot, shouldLoadSolanaWallet]);

	useEffect(() => {
		if (
			!pendingWalletAddress ||
			pendingWalletAddress === walletAddress ||
			!portfolioDataReady(pendingPortfolioStatus)
		) {
			return;
		}
		onOpenWallet(pendingWalletAddress);
	}, [
		onOpenWallet,
		pendingPortfolioStatus,
		pendingWalletAddress,
		walletAddress,
	]);

	useEffect(() => {
		if (pendingWalletAddress && pendingWalletAddress === walletAddress) {
			setPendingWalletAddress(null);
		}
	}, [pendingWalletAddress, walletAddress]);

	return (
		<div
			className={
				"scrollbar-none absolute inset-0 z-40 overflow-y-auto overflow-x-hidden bg-background pt-[64px] text-foreground" +
				(walletAddress ? " portfolio-detail-route" : "")
			}
		>
			{shouldShowLoading && loadWalletAddress ? (
				<>
					<PortfolioEmptyBackground />
					<PortfolioLoadingState
						address={loadWalletAddress}
						state={activeAddressStatus}
					/>
				</>
			) : walletAddress === null ? (
				<>
					<PortfolioEmptyBackground />
					<PortfolioEmptyState
						networkName={networkName}
						sampleWallets={sampleWallets}
						onSubmitAddress={handleSubmit}
					/>
				</>
			) : (
				<>
					<PortfolioDetailBackground />
					<main className="relative z-10 mx-auto max-w-6xl px-6 pt-6 pb-24">
						<div className="flex flex-row flex-wrap items-center justify-between gap-3 py-2">
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									onClick={onClearWallet}
									aria-label="New search"
								>
									<ArrowUpRightIcon className="-rotate-[135deg]" />
								</Button>
								<TokenLogo symbol={networkSymbol} className="size-9" />
								<div>
									<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.22em]">
										{networkName} wallet
									</div>
									<div className="font-mono text-sm tabular-nums">
										{shortenAddress(walletAddress)}
									</div>
								</div>
								<button
									type="button"
									onClick={() => copyToClipboard(walletAddress)}
									aria-label="Copy address"
									className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
								>
									<CopyIcon className="size-3.5" />
								</button>
							</div>
							<div className="flex items-center gap-2">
								<SearchAddressInput size="sm" onSubmit={handleSubmit} />
							</div>
						</div>

						<div className="mt-6">
							<NetWorthAndAllocation
								networkName={networkName}
								onPlotBucketChange={setPlotBucket}
								portfolio={portfolio}
								plotBucket={plotBucket}
								plotState={activePlotStatus}
							/>
						</div>

						<ProtocolStripRow
							networkSymbol={networkSymbol}
							portfolio={portfolio}
							selectedProtocolIds={selectedProtocolIds}
							onToggleProtocol={toggleProtocolSelection}
							onClearSelection={clearProtocolSelection}
						/>

						{!hasProtocolSelection && (
							<div className="mt-4">
								<HoldingsSection portfolio={portfolio} />
							</div>
						)}

						<div className="mt-4">
							<DefiPositionsSection portfolio={positionsPortfolio} />
						</div>
					</main>
				</>
			)}
		</div>
	);
}
