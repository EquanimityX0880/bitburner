export async function main(ns) {
	// you can push lists into lists.
	let temp = ["A", "B"]
	ns.tprint(temp[0]);
	ns.tprint(temp[1]);
	let a = ["C", "D"];
	temp.push(a);
	ns.tprint(temp); // this prints ["A","B",["C","D"]]
	ns.tprint(temp[2]); // this prints ["C","D"]
	ns.tprint(temp[3]); // this prints null
}

/*
  So in this game, if you want to create a webcrawler, 
  you'd have to make sure you're not pushing an entire list, but rather,
  each element in the list. This made it more complicated than I care to 
  deal with at 3:33 AM on a Sunday of all days.
*/
