// TypeScript: Declare Chart on window to avoid lint errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    Chart: any;
  }
}

"use client";

import { useEffect, useState } from "react";

const planData = [
	{
		provider: "Saily",
		planName: "Japan 20 GB",
		simType: "eSIM",
		planType: "fixed",
		priority: ["price"],
		data: 20,
		priceUSD: 22.99,
		pricePerGB: 1.15,
		network: "SoftBank/KDDI",
		description:
			"One of the cheapest per-GB options available, perfect for budget travelers with eSIM-compatible phones.",
		tags: ["eSIM", "price"],
	},
	{
		provider: "Airalo",
		planName: "Moshi Moshi 20 GB",
		simType: "eSIM",
		planType: "fixed",
		priority: ["price"],
		data: 20,
		priceUSD: 26.0,
		pricePerGB: 1.3,
		network: "SoftBank/KDDI",
		description:
			"Excellent value and a very popular choice for tech-savvy travelers looking to save money.",
		tags: ["eSIM", "price"],
	},
	{
		provider: "Ubigi",
		planName: "Japan 10 GB",
		simType: "eSIM",
		planType: "fixed",
		priority: ["price"],
		data: 10,
		priceUSD: 19.0,
		pricePerGB: 1.9,
		network: "NTT Docomo",
		description: "Great price for a plan that uses the high-quality Docomo network.",
		tags: ["eSIM", "price"],
	},
	{
		provider: "Sakura Mobile",
		planName: "5G Unlimited eSIM",
		simType: "eSIM",
		planType: "unlimited",
		priority: ["unlimited"],
		isTrulyUnlimited: true,
		priceJPY: 9900,
		effectivePricePerGB: 0,
		network: "au/KDDI",
		description:
			"The ultimate choice for heavy users. Truly unlimited high-speed data with no throttling.",
		tags: ["eSIM", "unlimited"],
	},
	{
		provider: "JAL ABC",
		planName: "Unlimited Prepaid SIM",
		simType: "physical",
		planType: "unlimited",
		priority: ["unlimited", "convenience"],
		isTrulyUnlimited: true,
		priceJPY: 7000,
		effectivePricePerGB: 0,
		network: "NTT Docomo",
		description:
			"Amazing value for a truly unlimited physical SIM, but must be purchased at the airport with limited English support.",
		tags: ["physical", "unlimited"],
	},
	{
		provider: "Sakura Mobile",
		planName: "4G Unlimited eSIM",
		simType: "eSIM",
		planType: "unlimited",
		priority: ["unlimited"],
		fup: "3 GB/day",
		priceJPY: 9900,
		effectivePricePerGB: 110,
		network: "NTT Docomo",
		description:
			"A reliable unlimited plan with a generous daily high-speed cap and excellent English support.",
		tags: ["eSIM", "unlimited", "convenience"],
	},
	{
		provider: "Mobal",
		planName: "Unlimited Data SIM",
		simType: "physical",
		planType: "unlimited",
		priority: ["unlimited", "convenience"],
		fup: "~3 GB/day",
		priceJPY: 7920,
		effectivePricePerGB: 88,
		network: "SoftBank",
		description:
			"Great value for an unlimited physical SIM with a solid daily data cap and free worldwide shipping.",
		tags: ["physical", "unlimited", "convenience"],
	},
	{
		provider: "Mobal",
		planName: "Voice + Data SIM",
		simType: "physical",
		planType: "phone",
		priority: ["phone"],
		fup: "Unlimited Data (FUP applies)",
		priceJPY: 7500,
		network: "SoftBank",
		description:
			"The best all-around option for travelers who absolutely need a Japanese phone number for calls.",
		tags: ["physical", "phone"],
	},
	{
		provider: "Mobal",
		planName: "Voice + Data eSIM",
		simType: "eSIM",
		planType: "phone",
		priority: ["phone"],
		fup: "Unlimited Data (FUP applies)",
		priceJPY: 7500,
		network: "SoftBank",
		description:
			"The eSIM version for those needing a Japanese phone number on a modern device.",
		tags: ["eSIM", "phone"],
	},
	{
		provider: "JAL ABC",
		planName: "Data & Voice SIM",
		simType: "physical",
		planType: "phone",
		priority: ["phone", "convenience"],
		data: 5,
		priceJPY: 9900,
		network: "NTT Docomo",
		description:
			"A voice and data option available for convenient purchase at the airport, but with limited data.",
		tags: ["physical", "phone"],
	},
	{
		provider: "Sakura Mobile",
		planName: "Physical SIM Pickup",
		simType: "physical",
		planType: "unlimited",
		priority: ["convenience"],
		fup: "~2 GB/day",
		priceJPY: 9900,
		network: "NTT Docomo",
		description:
			"The most convenient option for first-timers. Order online and pick it up at the airport or your hotel hassle-free.",
		tags: ["physical", "convenience"],
	},
];

const priorities = [
	{ key: "price", label: "💰 Best Price" },
	{ key: "unlimited", label: "⚡ Unlimited Data" },
	{ key: "phone", label: "📞 Phone Number" },
	{ key: "convenience", label: "✈️ Easy Setup" },
];
const simTypes = [
	{ key: "eSIM", label: "📱 eSIM (Digital)" },
	{ key: "physical", label: "💳 Physical SIM" },
];
const exploreFilters = [
	{ key: "all", label: "All" },
	{ key: "eSIM", label: "eSIM" },
	{ key: "physical", label: "Physical SIM" },
	{ key: "unlimited", label: "Unlimited" },
	{ key: "phone", label: "With Phone Number" },
];

function PlanCard({ plan }: { plan: any }) {
	let priceDisplay = plan.priceUSD
		? `$${plan.priceUSD.toFixed(2)} USD`
		: `¥${plan.priceJPY?.toLocaleString()} JPY`;
	let dataDisplay: React.ReactNode = null;
	if (plan.isTrulyUnlimited) {
		dataDisplay = (
			<span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
				Truly Unlimited
			</span>
		);
	} else if (plan.fup) {
		dataDisplay = (
			<span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
				{plan.fup}
			</span>
		);
	} else if (plan.data) {
		dataDisplay = (
			<span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
				{plan.data} GB Data
			</span>
		);
	}
	return (
		<div
			className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col"
			data-tags={plan.tags.join(" ")}
		>
			<div className="p-6 flex-grow">
				<h4 className="text-sm font-semibold text-gray-500">{plan.provider}</h4>
				<h3 className="text-xl font-bold mt-1">{plan.planName}</h3>
				<div className="my-3">
					{dataDisplay}
					<span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
						{plan.simType}
					</span>
				</div>
				<p className="text-gray-600 text-sm flex-grow">{plan.description}</p>
			</div>
			<div className="p-6 bg-gray-50">
				<span className="text-2xl font-bold text-[#3D405B]">{priceDisplay}</span>
				<span className="text-sm text-gray-500"> / plan</span>
			</div>
		</div>
	);
}

export default function TouristDataSimGuide() {
	const [priority, setPriority] = useState<string | null>(null);
	const [simType, setSimType] = useState<string | null>(null);
	const [exploreFilter, setExploreFilter] = useState<string>("all");
	const [showExplore, setShowExplore] = useState<boolean>(false);
	const [openAccordion, setOpenAccordion] = useState<number | null>(null);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://cdn.jsdelivr.net/npm/chart.js";
		script.async = true;
		script.onload = () => {
			setTimeout(() => {
				if (window.Chart) {
					const pricePerGbCanvas = document.getElementById("pricePerGbChart") as HTMLCanvasElement | null;
					if (pricePerGbCanvas) {
						const ctx = pricePerGbCanvas.getContext("2d");
						if (ctx) {
							const fixedPlans = planData.filter((p) => p.planType === "fixed");
							new window.Chart(ctx, {
								type: "bar",
								data: {
									labels: fixedPlans.map((p) => `${p.provider} ${p.planName}`),
									datasets: [
										{
											label: "Price per GB (USD)",
											data: fixedPlans.map((p) => p.pricePerGB),
											backgroundColor: "#81B29A",
											borderColor: "#6a9480",
											borderWidth: 1
										}
									],
								},
								options: {
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: { display: false },
										title: { display: false },
										tooltip: {
											callbacks: {
												label: function(context: any) {
												let label = context.dataset.label || '';
												if (label) { label += ': '; }
												if (context.parsed.y !== null) {
													label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
												}
												return label;
											}
										}
									}
									}
								},
								scales: {
									y: { beginAtZero: true, title: { display: true, text: "USD per GB" }, ticks: { color: '#6B7280' } },
									x: { ticks: { color: '#6B7280', autoSkip: false, maxRotation: 45, minRotation: 0 } }
								}
							});
						}
					}
					const unlimitedPriceCanvas = document.getElementById("unlimitedPriceChart") as HTMLCanvasElement | null;
					if (unlimitedPriceCanvas) {
						const ctx = unlimitedPriceCanvas.getContext("2d");
						if (ctx) {
							const unlimitedPlans = planData.filter((p) => p.planType === "unlimited" && !p.isTrulyUnlimited);
							new window.Chart(ctx, {
								type: "bar",
								data: {
									labels: unlimitedPlans.map((p) => `${p.provider} ${p.planName}`),
									datasets: [
										{
											label: "Effective Price per High-Speed GB (JPY)",
											data: unlimitedPlans.map((p) => p.effectivePricePerGB || 0),
											backgroundColor: "#E07A5F",
											borderColor: "#c9674f",
											borderWidth: 1
										}
									],
								},
								options: {
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: { display: false },
										title: { display: false },
										tooltip: {
											callbacks: {
												label: function(context: any) {
												let label = context.dataset.label || '';
												if (label) { label += ': '; }
												if (context.parsed.y !== null) {
													label += `¥${context.parsed.y.toLocaleString()}`;
												}
												return label;
											}
										}
									}
									}
								},
								scales: {
									y: { beginAtZero: true, title: { display: true, text: "JPY per GB" }, ticks: { color: '#6B7280' } },
									x: { ticks: { color: '#6B7280', autoSkip: false, maxRotation: 45, minRotation: 0 } }
								}
							});
						}
					}
				}
			}, 0);
		};
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, [showExplore]);

	// Recommendations logic
	const filteredPlans =
		priority && simType
			? planData.filter(
				(p) => p.priority.includes(priority) && p.simType === simType
			)
			: [];

	// Explore filter logic
	const explorePlans = planData.filter((plan) =>
		exploreFilter === "all" ? true : plan.tags.includes(exploreFilter)
	);

	return (
		<div className="container mx-auto px-4 md:px-8 py-8 font-sans text-gray-800">
			<header className="bg-white shadow-sm rounded-xl mb-8 p-6">
				<h1 className="text-3xl md:text-4xl font-black text-center text-[#3D405B] mb-2">
					Find Your Perfect Japan SIM
				</h1>
				<p className="text-center text-lg mt-1 text-gray-600">
					Answer two questions to get your personalized recommendation.
				</p>
			</header>
			{/* Interactive Recommender */}
			<section className="bg-white p-8 rounded-xl shadow-lg mb-8">
				<div className="grid md:grid-cols-2 gap-8 items-center">
					<div>
						<h2 className="text-2xl font-bold mb-4">
							1. What's most important to you?
						</h2>
						<div className="grid grid-cols-2 gap-4" id="priority-selector">
							{priorities.map((p) => (
								<button
									key={p.key}
									className={`p-4 rounded-lg font-semibold text-center btn-primary${
										priority === p.key ? " active" : ""
									}`}
									style={{
										backgroundColor:
											priority === p.key ? "#6a9480" : "#81B29A",
										color: "#fff",
									}}
									onClick={() => setPriority(p.key)}
								>
									{p.label}
								</button>
							))}
						</div>
					</div>
					<div>
						<h2 className="text-2xl font-bold mb-4">
							2. What kind of SIM do you need?
						</h2>
						<div className="grid grid-cols-2 gap-4" id="sim-type-selector">
							{simTypes.map((s) => (
								<button
									key={s.key}
									className={`p-4 rounded-lg font-semibold text-center btn-primary${
										simType === s.key ? " active" : ""
									}`}
									style={{
										backgroundColor:
										simType === s.key ? "#6a9480" : "#81B29A",
										color: "#fff",
									}}
									onClick={() => setSimType(s.key)}
								>
									{s.label}
								</button>
							))}
						</div>
					</div>
				</div>
			</section>
			{/* Dynamic Results */}
			<section className="mb-12">
				<h2 className="text-3xl font-bold text-center mb-6">
					Your Top Recommendations
				</h2>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="results-container">
					{priority && simType ? (
						filteredPlans.length > 0 ? (
							filteredPlans.map((plan) => (
								<PlanCard key={plan.provider + plan.planName} plan={plan} />
							))
						) : (
							<p className="text-center text-gray-500 text-lg mt-8 bg-gray-100 p-6 rounded-lg col-span-full">
								We couldn't find a perfect match for that combination. Try selecting a different priority or SIM type. <br /> Or, {" "}
								<span
									className="text-[#E07A5F] font-semibold underline cursor-pointer"
									onClick={() => { setShowExplore(true); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}
								>
									explore all options
								</span>{" "}
								below!
							</p>
						)
					) : (
						<p className="text-center text-gray-500 text-lg mt-8 bg-gray-100 p-6 rounded-lg col-span-full">
							{!priority && !simType
								? "Select an option from each category above to see our recommendations!"
								: `Great! Now select ${!priority ? "a priority" : "a SIM type"} to see your matches.`}
						</p>
					)
				}
			</div>
			</section>
			<div className="text-center my-12">
				{!showExplore && (
					<button
						className="btn-secondary font-bold py-3 px-6 rounded-full shadow-md"
						style={{ backgroundColor: "#E07A5F", color: "#fff" }}
						onClick={() => { setShowExplore(true); setTimeout(() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }), 100); }}
					>
						Not sure? Explore All Options ↓
					</button>
				)}
			</div>
			{/* Explore All Options */}
			{showExplore && (
				<section id="explore" className="mb-12">
					<h2 className="text-3xl font-bold text-center mb-8">
						Explore All Tourist SIMs
					</h2>
					<div className="bg-white p-6 rounded-xl shadow-lg mb-12">
						<h3 className="text-2xl font-bold text-center mb-4">
							Compare Plan Value
						</h3>
						<p className="text-center text-gray-600 mb-6 max-w-3xl mx-auto">
							These charts help you compare the true cost of data. For "unlimited" plans, we calculate the price for each high-speed gigabyte you can use before speeds are slowed down (based on a 30-day plan).
						</p>
						<div className="grid md:grid-cols-2 gap-8">
							<div>
								<h4 className="text-xl font-semibold text-center mb-2">
									Fixed Data Plans (Price per GB)
								</h4>
								<div className="chart-container">
									<canvas id="pricePerGbChart"></canvas>
								</div>
							</div>
							<div>
								<h4 className="text-xl font-semibold text-center mb-2">
									"Unlimited" Plans (Effective Price per High-Speed GB)
								</h4>
								<div className="chart-container">
									<canvas id="unlimitedPriceChart"></canvas>
								</div>
							</div>
						</div>
					</div>
					<div className="bg-white p-6 rounded-xl shadow-lg">
						<h3 className="text-2xl font-bold text-center mb-6">
							Filter All Providers
						</h3>
						<div className="flex flex-wrap justify-center gap-4 mb-8" id="explore-filters">
							{exploreFilters.map((f) => (
								<button
									key={f.key}
									className={`px-4 py-2 rounded-full font-semibold bg-gray-200${
										exploreFilter === f.key ? " btn-secondary active-filter" : ""
									}`}
									style={{
										backgroundColor:
											exploreFilter === f.key ? "#E07A5F" : "#e5e7eb",
										color:
											exploreFilter === f.key ? "#fff" : "#3D405B",
									}}
									onClick={() => setExploreFilter(f.key)}
								>
									{f.label}
								</button>
							))}
						</div>
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{explorePlans.map((plan) => (
								<PlanCard key={plan.provider + plan.planName + "explore"} plan={plan} />
							))}
						</div>
					</div>
				</section>
			)}
			{/* Key Things to Know Accordion */}
			<section className="mt-12">
				<h2 className="text-3xl font-bold text-center mb-8">
					Key Things To Know Before You Buy
				</h2>
				<div className="max-w-4xl mx-auto space-y-4">
					{accordionData.map((item, idx) => (
						<AccordionItem
							key={item.title}
							open={openAccordion === idx}
							onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
							title={item.title}
							content={item.content}
						/>
					))}
				</div>
			</section>
			<footer className="text-center p-6 mt-8 text-sm text-gray-500">
				<p>
					Data and analysis based on the 2025 Guide to Tourist Data SIMs in Japan
					report. All prices and plan details are subject to change.
				</p>
			</footer>
		</div>
	);
}

const accordionData = [
	{
		title: "eSIM vs. Physical SIM: Which is right for you?",
		content: (
			<>
				<p className="mb-4">
					<strong>📱 eSIM (Embedded SIM):</strong> A digital SIM you can
					install with a QR code. Best for convenience and modern phones.
				</p>
				<div className="p-4 rounded-lg bg-green-50 mb-4 pro-tip">
					<strong>Pros:</strong> Instant delivery online, setup before you
					travel, keep your home number active for calls/texts.
				</div>
				<div className="p-4 rounded-lg bg-red-50 con-tip">
					<strong>Cons:</strong> Only works on newer, unlocked phones
					(iPhone XS/XR+, Pixel 3+, etc.). Requires Wi-Fi for initial
					activation.
				</div>
				<p className="mb-4">
					<strong>💳 Physical SIM:</strong> The traditional plastic card
					you insert into your phone. Best for older phones or guaranteed
					compatibility.
				</p>
				<div className="p-4 rounded-lg bg-green-50 mb-4 pro-tip">
					<strong>Pros:</strong> Works in almost any unlocked phone.
				</div>
				<div className="p-4 rounded-lg bg-red-50 con-tip">
					<strong>Cons:</strong> Must be picked up at the airport/hotel or
					shipped to you, which can be less convenient.
				</div>
			</>
		),
	},
	{
		title: 'The "Unlimited" Data Myth: What is a FUP?',
		content: (
			<>
				<p>
					Most "unlimited" plans in Japan have a {" "}
					<strong>Fair Usage Policy (FUP)</strong>. This means you get a
					certain amount of high-speed data per day (e.g., 2GB or 3GB). If
					you exceed it, your speed is severely slowed down (throttled)
					until the next day.
				</p>
				<ul className="list-disc list-inside mt-2 space-y-1">
					<li>
						<strong>Throttled speeds</strong> are only good for basic
						messaging (like WhatsApp text).
					</li>
					<li>
						<strong>Truly unlimited</strong> plans with no FUP exist but
						are more expensive (e.g., Sakura Mobile's 5G plan).
					</li>
					<li>
						Always check the FUP before buying an "unlimited" plan to
						know what you're really getting.
					</li>
				</ul>
			</>
		),
	},
	{
		title: "The #1 Requirement: Is Your Phone Unlocked?",
		content: (
			<>
				<p>
					To use any Japanese tourist SIM (physical or eSIM), your phone
					<strong>must be unlocked</strong>. This means it's not restricted
					to your home carrier's network.
				</p>
				<p className="mt-2">
					If you bought your phone on a payment plan from a carrier
					(especially in the US), it might be locked. {" "}
					<strong>
						Contact your home carrier *before* you travel to confirm it's
						unlocked.
					</strong>{" "}
					If it's locked, a tourist SIM will not work.
				</p>
			</>
		),
	},
];

function AccordionItem({
	title,
	content,
	open,
	onClick,
}: {
	title: string;
	content: React.ReactNode;
	open: boolean;
	onClick: () => void;
}) {
	return (
		<div className="accordion-item bg-white rounded-lg shadow-md">
			<h3
				className="accordion-header flex justify-between items-center w-full p-5 font-semibold text-left text-lg cursor-pointer"
				onClick={onClick}
			>
				{title}
				<span
					className={`accordion-icon text-2xl font-light transform transition-transform ${
						open ? "rotate-45" : ""
					}`}
				>
					{open ? "−" : "+"}
				</span>
			</h3>
			<div
				className="accordion-content overflow-hidden transition-all duration-500 ease-in-out"
				style={{ maxHeight: open ? 999 : 0 }}
			>
				<div className="p-5 pt-0 text-gray-600">{content}</div>
			</div>
		</div>
	);
}
