"use client";

import { useEffect, useState } from "react";

export function useScrollSpy(ids: string[], offset = 130) {
	const key = ids.join("|");
	const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

	useEffect(() => {
		if (ids.length === 0) {
			setActiveId(null);
			return;
		}

		let frame = 0;

		const compute = () => {
			frame = 0;

			let current: string | null = null;
			for (const id of ids) {
				const el = document.getElementById(id);
				if (!el) {
					continue;
				}

				if (el.getBoundingClientRect().top - offset <= 0) {
					current = id;
				}
			}

			if (!current) {
				current = ids.find((id) => document.getElementById(id)) ?? ids[0] ?? null;
			}

			const scrolledToBottom =
				window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
			if (scrolledToBottom) {
				const last = [...ids].reverse().find((id) => document.getElementById(id));
				if (last) {
					current = last;
				}
			}

			setActiveId(current);
		};

		const onScroll = () => {
			if (frame) {
				return;
			}
			frame = requestAnimationFrame(compute);
		};

		compute();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);

		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (frame) {
				cancelAnimationFrame(frame);
			}
		};
	}, [key, offset]);

	return activeId;
}
