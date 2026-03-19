(function() {
    const header = document.querySelector(".site-header");
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav");
    const navLinks = nav ? nav.querySelectorAll("a") : [];

    if (burger && header) {
        const setExpanded = (isOpen) => burger.setAttribute("aria-expanded", String(isOpen));

        const openNav = () => {
            header.classList.add("nav-open");
            setExpanded(true);
        };

        const closeNav = () => {
            header.classList.remove("nav-open");
            setExpanded(false);
        };

        const toggleNav = () => {
            const isOpen = header.classList.contains("nav-open");
            isOpen ? closeNav() : openNav();
        };

        burger.addEventListener("click", toggleNav);

        navLinks.forEach((a) => a.addEventListener("click", closeNav));

        document.addEventListener("click", (e) => {
            if (!header.classList.contains("nav-open")) return;
            const target = e.target;
            const clickedInsideHeader = header.contains(target);
            if (!clickedInsideHeader) closeNav();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeNav();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 760) closeNav();
        });

        setExpanded(false);
    }

    const puppies = [{
            id: "luna",
            name: "Луна",
            age: "3 міс",
            price: "1200 грн",
            desc: "Грайлива, лагідна, любить дітей",
            img: "assets/images/puppy1.png",
            alt: "Луна — біле цуценя",
        },
        {
            id: "max",
            name: "Макс",
            age: "4 міс",
            price: "1500 грн",
            desc: "Активний, швидко навчається, соціальний",
            img: "assets/images/puppy2.png",
            alt: "Макс — руде цуценя",
        },
    ];

    const tableBody = document.querySelector(".catalog-table tbody");
    if (tableBody && tableBody.children.length === 0) {
        const rows = puppies
            .map(
                (p) => `
        <tr>
          <td><img src="${p.img}" alt="${p.alt}"></td>
          <td>${p.name}</td>
          <td>${p.desc}</td>
          <td>${p.age}</td>
          <td>${p.price}</td>
        </tr>`
            )
            .join("");
        tableBody.insertAdjacentHTML("beforeend", rows);
    }

    const select = document.querySelector('select[name="puppy"]');
    if (select && select.options.length <= 1) {
        puppies.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.name;
            select.appendChild(opt);
        });
    }

    const requestForm = document.querySelector(".request-form");
    if (requestForm) {
        requestForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(requestForm);
            const name = (formData.get("name") || "")
                .toString()
                .trim();
            const puppy = (formData.get("puppy") || "")
                .toString()
                .trim();

            const msg = document.createElement("p");
            msg.style.marginTop = "0.8rem";
            msg.textContent = `Заявку надіслано. Дякуємо${name ? ", " + name : ""}! ${puppy ? "Обране цуценя: " + puppy + "." : ""}`;
            msg.setAttribute("role", "status");

            const old = requestForm.querySelector('[role="status"]');
            if (old) old.remove();
            requestForm.appendChild(msg);

            requestForm.reset();
        });
    }

    const feedbackForm = document.querySelector(".feedback-form");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(feedbackForm);
            const author = (formData.get("name") || "")
                .toString()
                .trim();
            const review = (formData.get("review") || "")
                .toString()
                .trim();
            if (!review) return;

            const list = document.querySelector("#feedback .reviews");
            if (list) {
                const item = document.createElement("div");
                item.className = "review-item";
                item.innerHTML = `<strong>${author || "Анонім"}</strong><p>${review}</p>`;
                list.prepend(item);
            }

            feedbackForm.reset();
        });
    }
})();
