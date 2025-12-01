class HanoiCons {
	constructor(cons = null) {
		this.cons = cons;
	}
	getHead() {
		return this.cons?.[0] ?? Infinity;
	}
	getRest() {
		return this.cons?.[1] ?? null;
	}
	add(n) {
		if (n > this.getHead()) return false;
		this.cons = [n, this.cons];
		return true;
	}
	remove() {
		const n = this.getHead();
		this.cons = this.getRest();
		return n;
	}
	len() {
		return this.remove() !== Infinity ? 1 + this.len() : 0;
	}
	toArray(r = []) {
		const a = this.remove();
		return a !== Infinity ? this.toArray([...r, a]) : r;
	}
	copy() {
		return new HanoiCons(this.cons);
	}
}

class Game {
	constructor(from, to, num) {
		this.from = from;
		this.to = to;
		this.num = num;
		this.slots = Array.from(document.querySelectorAll('.slot'));
		this.consMap = new WeakMap(this.slots.map(n => [n, new HanoiCons()]));
		this.plates = this.addPlates();
		this.dragablify();
	}
	addPlate(level, idx) {
		const div = document.createElement('div');
		div.className = 'plate';
		div.style.width = level + '%';
		this.slots[0].appendChild(div);
		this.consMap.get(this.slots[0]).add(level);
		div.id = `plate_${idx}`;
		div.draggable = true;
		return div;
	}
	addPlates() {
		return Array(this.num)
			.fill(this.from)
			.map((n, i) => n + (this.to - this.from) * (i / (this.num - 1)))
			.map(Math.floor)
			.reverse()
			.map((n, idx) => this.addPlate(n, idx));
	}
	dragablify() {
		this.slots.forEach(slot => {
			const cons = this.consMap.get(slot);
			slot.ondragenter = () => { };
			slot.ondragleave = () => { };
			slot.ondragover = e => e.preventDefault();
			slot.ondrop = e => {
				const id = e.dataTransfer.getData('plateNow');
				const plate = document.getElementById(id);
				const preCons = this.consMap.get(plate.parentElement);
				const n = preCons.remove();
				if (!cons.add(n)) {
					preCons.add(n);
					return;
				}
				plate.parentNode.removeChild(plate);
				slot.appendChild(plate);
				console.log(this.slots.map(n => this.consMap.get(n)).map(n => n.copy().toArray().toString() + ' ' + n.copy().len()));
				if (this.consMap.get(this.slots[2]).copy().len() === this.num) {
					console.log('Win');
				}
			};
		});
		this.plates.forEach(plate => {
			plate.ondragstart = e => {
				e.dataTransfer.setData('plateNow', plate.id);
			};
			plate.ondrag = () => { };
			plate.ondragend = () => { };
		});
	}
	end() {
		this.plates.forEach(plate => {
			plate.parentNode.removeChild(plate);
		});
	}
}

const a = new Game(30, 80, 3);
