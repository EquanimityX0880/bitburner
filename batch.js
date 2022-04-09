/** @param {NS} ns */
export async function main(ns) {
	/*
	What does it do:
		Manages the timings of one cycle. Prep for recursion.
		One cycle weakens, grows, weakens, hacks to maximize income
		Each script finishes about 1 second after the last.
		Prevents the overuse and waste of threads
	
	How does it work:
		Same as hackController.js

		But the timings of weaken, grow, weaken, hack is predicted.
	*/

	// argument info
	const host = ns.args[0];
	const target = ns.args[1];

	// upload files server
	const files = ["/shared/hack.js", "/shared/grow.js", "/shared/weaken.js"];
	await ns.scp(files, ns.getHostname(), host);

	// variables
	const maxRam = ns.getServerMaxRam(host);
	const usedRam = ns.getServerUsedRam(host);

	const minSecurity = ns.getServerMinSecurityLevel(target);
	const securityThreshhold = minSecurity + 2;

	const maxMoney = ns.getServerMaxMoney(target);
	let moneyThresh = maxMoney * 0.75;

	while (1) {
		await ns.sleep(10);
		// host ram info
		let availableRam = maxRam - usedRam;
		let slots = availableRam / 2

		// target server security info
		let currentSecurity = ns.getServerSecurityLevel(target);
		let secThreads2Min = Math.ceil((currentSecurity - minSecurity) * 20);

		// target server money info
		let currentMoney = ns.getServerMoneyAvailable(target); // monitoring
		let hackThreads2Thresh = Math.ceil(ns.hackAnalyzeThreads(target, currentMoney * 0.25))
		// threads to run for each hack, only pulls a percentage
		let growThreads2Max = Infinity;
		if (currentMoney != 0) { growThreads2Max = (Math.ceil(ns.growthAnalyze(target, maxMoney / currentMoney))); }

		// how many threads to run?
		let wThread = secThreads2Min;

		let gThread = growThreads2Max; // this is zero if current money = max money and infinity if current money = 0
		let hThread = hackThreads2Thresh;

		ns.clearLog();
		ns.print(`${target}:`);
		ns.print(` $_______: ${ns.nFormat(currentMoney, "$0.000a")} / ${ns.nFormat(maxMoney, "$0.000a")} (${(currentMoney / maxMoney * 100).toFixed(2)}%)`);
		ns.print(`Security: ${currentSecurity} Min Security: ${minSecurity}`);
		ns.print(` security change: +${(currentSecurity - minSecurity).toFixed(2)}`);
		ns.print(` hack____: ${ns.tFormat(ns.getHackTime(target))} (t=${Math.ceil(ns.hackAnalyzeThreads(target, currentMoney))})`);
		ns.print(` grow____: ${ns.tFormat(ns.getGrowTime(target))} (t=${growThreads2Max})`);
		ns.print(` weaken__: ${ns.tFormat(ns.getWeakenTime(target))} (t=${Math.ceil((currentSecurity - minSecurity) * 20)})`);


		// sequential order for cycle: W - > GWHW
		// timings of grow, hack, weaken
		// sort these times, find the minimum time per cycle
		let spacer = 30;
		let timings = [ns.getGrowTime(target), ns.getHackTime(target), ns.getWeakenTime(target)];
		ns.print(`growtime: ${timings[0]}`);
		ns.print(`hacktime: ${timings[1]}`);
		ns.print(`weakentime: ${timings[2]}`);

		// - - - weaken 
		const x = 2;
		const y = 5;
		const z = 10;
		const gBPerBatch = 1.75 * x + 1.75 * y + 1.7 * z;
		let batches = 1;

		ns.print(`weaken threads: ${batches * x}`);
		ns.print(`grow threads: ${batches * y}`);
		ns.print(`hack threads: ${batches * z}`);
		//ns.weaken
		//ns.grow
		ns.exec("/shared/weaken.js", host, batches * x, target);
		await ns.sleep(spacer);

		ns.exec("/shared/weaken.js", host, batches * x, target, "a");
		await ns.sleep(timings[2] + spacer*4);

		ns.exec("/shared/grow.js", host, batches * y, target);
		await ns.sleep(timings[2] - timings[1] + spacer);

		ns.exec("/shared/hack.js", host, batches * z, target);
		await ns.sleep(spacer);
	}
}
