/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.clearLog();
	// remove duplicates from a list
	var scanned = [];
	var queue = ["home"];

	function compare() {
		ns.print(`compare`)
		// Format: scanned, queue
		for (var i = 0; i < scanned.length; ++i) {
			for (var ii = 0; ii < queue.length; ++ii) {
				if (scanned[i] === queue[ii]) {
					queue.splice(ii, 1)
					ii = 0
				}
			}
		}
		//ns.print(`After: ${queue}`)
		return
	}
	function removeDuplicates() {
		ns.print(`remove duplicate`)
		// Removes duplicates from a string list. 
		ns.print(`~ Before: ${queue}. Length: ${queue.length}`);
		for (var i = 0; i < queue.length; ++i) {
			for (var ii = 0; ii < queue.length; ++ii) {
				if (i !== ii && queue[i] == queue[ii]) {
					ns.print(`~ Duplicate ${queue[i]} found at ${ii}. Deleting...`)
					queue.splice(ii, 1)
					ii = 0
				}
			}
		}
		//ns.print(`~ After: ${test1}. Length: ${test1.length}`);
	}
	async function webCrawl() {
		var iterations = 1;
		while (queue.length != 0) {
			// scan the server at queue[0]. Append results to a queue list, append scanned server to a scanned list
			// and check for duplicates.

			ns.print(`~~Scanning ${queue[0]}`)
			var temp = ns.scan(queue[0]);
			for (var i = 0; i < temp.length; ++i)
				queue.push(temp[i])
			scanned.push(queue[0])
			//ns.print(`Known: ${scanned}`)
			queue.splice(0, 1);
			removeDuplicates()
			compare()
			await ns.sleep(1);
			iterations = iterations + 1;
		}
		ns.print(`\nTotal Iterations: ${iterations}`)
		await ns.write("ServerInfo.txt", "Server Info", "w")
		for (var i = 0; i < scanned.length; ++i) {
			await ns.write("ServerInfo.txt", "\n~~~~~~~~~~~~~~~~\n", "a")
			await ns.write("ServerInfo.txt", scanned[i], "a")
		}
	}

	await webCrawl()
}
