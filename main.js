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
	readyBtns() {
		this.btns.forEach(btnSelect => {
			btnSelect.hidden = false;
			btnSelect.innerHTML = '选择';
			btnSelect.onclick = () => {
				const slotFrom = btnSelect.parentElement;
				const level = this.consMap.get(slotFrom).getHead();
				if (level === Infinity) return;
				const plate = document.getElementById('plate_' + level);
				const div = document.createElement('div');
				div.style.width = btnSelect.clientWidth + 'px';
				div.style.height = btnSelect.clientHeight + 'px';
				slotFrom.insertBefore(div, slotFrom.children[0]);
				btnSelect.hidden = true;
				this.btns.forEach(btnMove => {
					btnMove.innerHTML = '放置';
					btnMove.onclick = () => {
						this.move(plate, btnMove.parentElement);
						slotFrom.removeChild(div);
						this.readyBtns();
					}
				});
			};
		});
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
	move(plateFrom, slotTo) {
		const cons = this.consMap.get(slotTo);
		const preCons = this.consMap.get(plateFrom.parentElement);
		if (cons === preCons) return;
		const n = preCons.remove();
		if (!cons.add(n)) {
			preCons.add(n);
			return;
		}
		plateFrom.parentNode.removeChild(plateFrom);
		slotTo.appendChild(plateFrom);
		console.log(this.slots.map(n => this.consMap.get(n)).map(n => n.copy().toArray().toString() + ' ' + n.copy().len()));
		step_span.innerHTML = parseInt(step_span.innerHTML) + 1;
		if (this.consMap.get(this.slots[2]).copy().len() === this.num) {
			console.log('Win');
		}
	}
	dragablify() {
		this.slots.forEach(slot => {
			slot.ondragenter = () => { };
			slot.ondragleave = () => { };
			slot.ondragover = e => e.preventDefault();
			slot.ondrop = e => {
				const id = e.dataTransfer.getData('plateNow');
				const plate = document.getElementById(id);
				this.move(plate, slot);
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
		step_span.innerHTML = 0;
	}
}

const fromWidth = 20;
const toWidth = 90;
let a = { end() { } };
start_button.onclick = () => {
	a.end();
	a = new Game(fromWidth, toWidth, parseInt(num_input.value));
};
start_button.click();

