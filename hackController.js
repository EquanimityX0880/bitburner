/** @param {NS} ns */
export async function main(ns) {
	/*
	What does it do:
		Manages the timings of scripts hack, grow, weaken to maximize income
		Prevents the overuse and waste of threads
	
	How does it work:
		Command Priority System
			1. execute Weaken.js if security > threshhold
			2. run Grow.js if money < moneyMax * 0.75
			3. run Hack.js if security < threshhold && money > moneyMax * 0.75
	
		RAM monitoring system
			The function will not create more threads than it's capable of running
			The function will not run Weaken, Grow, or Hack alongside each other (Linear fashion)
			The function will not run more threads than it needs to
	*/

	// argument info
	const host = ns.args[0];
	const target = ns.args[1];

	// upload files server
	const files = ["/shared/hack.js", "/shared/grow.js", "/shared/weaken.js"];
	await ns.scp(files, ns.getHostname(), host);

	while (1) {
		// host ram info
		let maxRam = ns.getServerMaxRam(host);
		let usedRam = ns.getServerUsedRam(host);
		let availableRam = maxRam - usedRam;
		let slots = availableRam/2

		// target server security info
		let currentSecurity = ns.getServerSecurityLevel(target);
		let minSecurity = ns.getServerMinSecurityLevel(target);
		let securityThreshhold = minSecurity + 3;
		let secThreads2Min = Math.ceil((currentSecurity - minSecurity) * 20);

		// target server money info
		let maxMoney = ns.getServerMaxMoney(target);
		let moneyThresh = maxMoney * 0.75;
		let currentMoney = ns.getServerMoneyAvailable(target); // monitoring
		let hackThreads2Min = ns.hackAnalyzeThreads(target, maxMoney); //monitoring
		let hackThreads2Thresh = Math.ceil(ns.hackAnalyzeThreads(target, currentMoney*0.25)) // threads to run for each hack, only pulls a percentage
		let growThreads2Max = (Math.ceil(ns.growthAnalyze(target, maxMoney / currentMoney)));
		
		let wThread = secThreads2Min;
		let gThread = growThreads2Max; // this is zero for some reason
		let hThread = hackThreads2Thresh;

		ns.tprint(`${hThread}`);

		// sequential order: WGHGH
		//	Command Priority System
		//	1. execute Weaken.js if security > threshhold
		//	2. run Grow.js if money < moneyMax * 0.75
		//	3. run Hack.js if security < threshhold && money > moneyMax * 0.75

		// exception for weaken: if currentSecurity == minSecurity, don't run the loop
		if (hThread > slots) hThread = slots;
		// weaken
		if ((currentSecurity > securityThreshhold) && (secThreads2Min != 0)) {
			if (wThread > slots) {wThread = slots};
			ns.exec("/shared/weaken.js", host, wThread, target);
			await ns.sleep(ns.getWeakenTime(target)+20);
			ns.kill("/shared/weaken.js", host, target);
		}
		// grow
		if (currentMoney < moneyThresh) {
			if (gThread > slots) {gThread = slots};
			ns.exec("/shared/grow.js", host, gThread, target);
			await ns.sleep(ns.getGrowTime(target)+20);
			ns.kill("/shared/grow.js", host, target);
		}
		// hack 
		if (currentSecurity < securityThreshhold && currentMoney > moneyThresh) {
			if (hThread > slots) {hThread = slots};
			ns.exec("/shared/hack.js", host, hThread, target);
			await ns.sleep(ns.getHackTime(target)+20);
			ns.kill("/shared/hack.js", host, target);
		}
		await ns.sleep(20);
	}
}
