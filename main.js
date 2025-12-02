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
		this.btns = Array.from(document.querySelectorAll(".btn"));
		this.readyBtns();
		this.dragablify();
	}
	hiddenBtn(btn) {
		btn.hidden = true;
		btn.onclick = () => { };
	}
	showBtn(btn, text, onclick) {
		btn.hidden = false;
		btn.innerHTML = text;
		btn.onclick = () => onclick();
	}
	win() {
		this.btns.forEach(this.hiddenBtn);
		step_span.innerHTML += ' 你赢了！'
	}
	readyBtns() {
		this.btns
			.map(btnFrom => {
				const slotFrom = btnFrom.parentElement;
				const consFrom = this.consMap.get(slotFrom);
				return { btnFrom, slotFrom, consFrom };
			})
			.filter(({ btnFrom, consFrom }) =>
				consFrom.getHead() !== Infinity || (this.hiddenBtn(btnFrom), false)
			)
			.map(({ btnFrom, slotFrom, consFrom }) => [btnFrom, '选择', () => this.btns
				.filter(btnTo =>
					btnTo !== btnFrom || (this.showBtn(btnFrom, '取消', () => this.readyBtns()), false)
				)
				.map(btnTo => {
					const level = consFrom.getHead();
					const plate = document.getElementById('plate_' + level);
					const slotTo = btnTo.parentElement;
					const consTo = this.consMap.get(slotTo);
					return { plate, level, slotTo, consTo, btnTo };
				})
				.map(({ btnTo, consTo, plate, slotTo }) => [btnTo, '放置', () => {
					const n = consFrom.remove();
					if (!consTo.add(n)) {
						consFrom.add(n);
					} else {
						slotFrom.removeChild(plate);
						slotTo.appendChild(plate);
						step_span.innerHTML = parseInt(step_span.innerHTML) + 1;
						if (this.consMap.get(this.slots[2]).copy().len() === this.num) return this.win();
					}
					this.readyBtns();
				}])
				.map(n => this.showBtn(...n))
			])
			.map(n => this.showBtn(...n));
	}
	addPlate(level, idx) {
		const div = document.createElement('div');
		div.className = 'plate';
		div.style.width = level + '%';
		this.slots[0].appendChild(div);
		this.consMap.get(this.slots[0]).add(level);
		div.id = `plate_${level}`;
		div.draggable = true;
		div.innerHTML = idx + 1;
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
		this.plates.forEach(plate => {
			plate.ondragstart = e => {
				e.dataTransfer.setData('plateNow', plate.id);
			};
			plate.ondrag = () => { };
			plate.ondragend = () => { };
		});
		this.slots.forEach(slot => {
			slot.ondragenter = () => { };
			slot.ondragleave = () => { };
			slot.ondragover = e => e.preventDefault();
			slot.ondrop = e => {
				const id = e.dataTransfer.getData('plateNow');
				const plate = document.getElementById(id);
				plate.parentElement.querySelector('button').click();
				slot.querySelector('button').click();
			};
		});
	}
	end() {
		this.plates.forEach(plate => plate.parentNode.removeChild(plate));
		step_span.innerHTML = 0;
	}
}

const fromWidth = 20;
const toWidth = 90;
let a = null;
start_button.onclick = () => {
	a?.end?.();
	a = new Game(fromWidth, toWidth, parseInt(num_input.value));
};
start_button.click();

