/*
 * Кастомні випадаючі списки замість нативних <select>.
 * Підключення (на кожній сторінці, після global.css):
 *   <script src="select.js" defer></script>
 *
 * - Автоматично обробляє всі <select> (і ті, що з'являться в DOM пізніше).
 * - Оригінальний <select> ховається, але лишається джерелом істини:
 *   вибір записується в нього, а на ньому викликаються події input/change.
 * - Класи оригіналу копіюються на обгортку .cselect, тому наявні стилі
 *   (.select, .select-styled, .group-select …) продовжують працювати.
 * - Програмні зміни (select.value = …, select.innerHTML = …) підхоплюються
 *   автоматично. Якщо щось не оновилось: window.customSelect.refresh(select).
 * - <select multiple> та <select size="N"> не чіпаються.
 */
(() => {
  "use strict";

  const GAP = 6; // відступ між полем і списком, px
  const MAX_HEIGHT = 260; // максимальна висота списку, px

  const registry = new WeakMap();
  let openInstance = null;
  let uid = 0;

  class CustomSelect {
    constructor(select) {
      this.select = select;
      this.id = `cselect-${++uid}`;
      this.items = [];
      this.activeIndex = -1;

      this.build();
      this.bind();
      this.sync();
      registry.set(select, this);
    }

    /* ---------- Створення DOM ---------- */

    build() {
      const { select } = this;

      this.root = document.createElement("div");
      this.trigger = document.createElement("button");
      this.valueEl = document.createElement("span");
      this.list = document.createElement("ul");

      this.trigger.type = "button";
      this.trigger.className = "cselect__trigger";
      this.trigger.setAttribute("role", "combobox");
      this.trigger.setAttribute("aria-haspopup", "listbox");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-controls", this.id);
      this.valueEl.className = "cselect__value";
      this.trigger.append(this.valueEl);

      this.list.id = this.id;
      this.list.className = "cselect__list";
      this.list.setAttribute("role", "listbox");

      this.root.append(this.trigger);
      select.after(this.root);

      select.dataset.cselect = "true"; // CSS ховає такий select
      select.tabIndex = -1;
      select.setAttribute("aria-hidden", "true");
    }

    bind() {
      const { select, trigger, list } = this;
      const indexOf = (target) =>
        this.items.findIndex(
          (item) => item.li === target.closest(".cselect__option"),
        );

      trigger.addEventListener("click", () => this.toggle());
      trigger.addEventListener("keydown", (e) => this.onKeydown(e));
      // Пробіл викликає click на keyup — глушимо, щоб список не відкривався двічі
      trigger.addEventListener("keyup", (e) => {
        if (e.key === " ") e.preventDefault();
      });

      list.addEventListener("mousedown", (e) => {
        // Не віддавати фокус з кнопки (але не блокувати скролбар)
        if (e.target.closest(".cselect__option")) e.preventDefault();
      });
      list.addEventListener("click", (e) => this.choose(indexOf(e.target)));
      list.addEventListener("mouseover", (e) => {
        const i = indexOf(e.target);
        if (i >= 0 && !this.items[i].disabled) this.setActive(i, false);
      });

      select.addEventListener("change", () => this.sync());
      select.form?.addEventListener("reset", () =>
        setTimeout(() => this.sync()),
      );
      for (const label of select.labels ?? []) {
        label.addEventListener("click", (e) => {
          e.preventDefault();
          trigger.focus();
        });
      }

      // Зміни варіантів / класів / disabled / hidden
      new MutationObserver(() => this.sync()).observe(select, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "disabled", "hidden"],
      });

      // Програмні select.value = … та select.selectedIndex = … не викликають подій
      for (const prop of ["value", "selectedIndex"]) {
        const native = Object.getOwnPropertyDescriptor(
          HTMLSelectElement.prototype,
          prop,
        );
        Object.defineProperty(select, prop, {
          configurable: true,
          get: () => native.get.call(select),
          set: (v) => {
            native.set.call(select, v);
            this.sync();
          },
        });
      }
    }

    /* ---------- Синхронізація з <select> ---------- */

    sync() {
      const { select, root, trigger } = this;

      root.className = `cselect ${select.className}`.trim();
      root.hidden = select.hidden;
      trigger.disabled = select.disabled;
      this.renderOptions();

      const selected = select.selectedOptions[0];
      this.valueEl.textContent = selected?.text.trim() || "\u00a0";
      trigger.classList.toggle(
        "is-placeholder",
        !selected || selected.value === "",
      );

      if (openInstance === this) {
        this.setActive(
          this.items.findIndex((item) => item.opt.selected),
          false,
        );
        this.place();
      }
    }

    renderOptions() {
      this.items = [];
      this.list.replaceChildren();

      for (const node of this.select.children) {
        if (node.tagName === "OPTGROUP") {
          const group = document.createElement("li");
          group.className = "cselect__group";
          group.setAttribute("role", "presentation");
          group.textContent = node.label;
          this.list.append(group);
          for (const opt of node.children) this.addOption(opt, node.disabled);
        } else {
          this.addOption(node, false);
        }
      }
    }

    addOption(opt, groupDisabled) {
      if (opt.hidden) return;

      const li = document.createElement("li");
      const disabled = opt.disabled || groupDisabled;

      li.id = `${this.id}-${this.items.length}`;
      li.className = "cselect__option";
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(opt.selected));
      if (disabled) li.setAttribute("aria-disabled", "true");
      li.textContent = opt.text.trim();

      this.list.append(li);
      this.items.push({ opt, li, disabled });
    }

    /* ---------- Відкриття / закриття ---------- */

    toggle() {
      if (openInstance === this) this.close();
      else this.open();
    }

    open() {
      if (this.trigger.disabled || openInstance === this) return;
      openInstance?.close();
      openInstance = this;

      // Список виносимо в <body>, щоб його не обрізали overflow/transform предків
      document.body.append(this.list);
      this.root.dataset.open = "true";
      this.trigger.setAttribute("aria-expanded", "true");

      const selected = this.items.findIndex((item) => item.opt.selected);
      this.setActive(
        selected >= 0 ? selected : this.items.findIndex((i) => !i.disabled),
      );
      this.place();
    }

    close() {
      if (openInstance !== this) return;
      openInstance = null;

      this.list.remove();
      delete this.root.dataset.open;
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.removeAttribute("aria-activedescendant");
    }

    place() {
      const { list } = this;
      if (!this.root.isConnected) return this.close();

      const rect = this.root.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom - GAP * 2;
      const above = rect.top - GAP * 2;
      const height = Math.min(list.scrollHeight, MAX_HEIGHT);
      const flip = below < height && above > below; // відкрити вгору, якщо знизу тісно

      list.style.minWidth = `${rect.width}px`;
      list.style.maxHeight = `${Math.max(Math.min(MAX_HEIGHT, flip ? above : below), 80)}px`;
      list.style.left = `${Math.max(GAP, Math.min(rect.left, window.innerWidth - list.offsetWidth - GAP))}px`;
      list.style.top = flip ? "auto" : `${rect.bottom + GAP}px`;
      list.style.bottom = flip
        ? `${window.innerHeight - rect.top + GAP}px`
        : "auto";
    }

    /* ---------- Вибір і навігація ---------- */

    choose(index) {
      const item = this.items[index];
      if (!item || item.disabled) return;

      if (!item.opt.selected) {
        item.opt.selected = true;
        this.select.dispatchEvent(new Event("input", { bubbles: true }));
        this.select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      this.close();
      this.trigger.focus();
    }

    setActive(index, scroll = true) {
      this.items[this.activeIndex]?.li.classList.remove("is-active");
      this.activeIndex = index;

      const item = this.items[index];
      if (!item) return this.trigger.removeAttribute("aria-activedescendant");

      item.li.classList.add("is-active");
      this.trigger.setAttribute("aria-activedescendant", item.li.id);
      if (scroll) item.li.scrollIntoView({ block: "nearest" });
    }

    step(dir) {
      let i = this.activeIndex;
      do i += dir;
      while (this.items[i]?.disabled);
      if (this.items[i]) this.setActive(i);
    }

    edge(last) {
      const order = [...this.items.keys()];
      if (last) order.reverse();
      const i = order.find((k) => !this.items[k].disabled);
      if (i !== undefined) this.setActive(i);
    }

    onKeydown(e) {
      const isOpen = openInstance === this;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) this.step(e.key === "ArrowDown" ? 1 : -1);
          else this.open();
          break;
        case "Home":
        case "End":
          if (!isOpen) return;
          e.preventDefault();
          this.edge(e.key === "End");
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen) this.choose(this.activeIndex);
          else this.open();
          break;
        case "Escape":
          if (!isOpen) return;
          e.preventDefault();
          e.stopPropagation(); // щоб не закрилась модалка під списком
          this.close();
          break;
        case "Tab":
          this.close();
          break;
      }
    }
  }

  /* ---------- Глобальні слухачі (один раз) ---------- */

  document.addEventListener("pointerdown", (e) => {
    if (!openInstance) return;
    const { root, list } = openInstance;
    if (!root.contains(e.target) && !list.contains(e.target))
      openInstance.close();
  });
  window.addEventListener("resize", () => openInstance?.place());
  window.addEventListener(
    "scroll",
    (e) => {
      if (openInstance && !openInstance.list.contains(e.target))
        openInstance.place();
    },
    true,
  );

  /* ---------- Автоініціалізація ---------- */

  const enhance = (select) => {
    if (select.dataset.cselect || select.multiple || select.size > 1) return;
    new CustomSelect(select);
  };

  const scan = (node) => {
    if (node.matches?.("select")) enhance(node);
    node.querySelectorAll?.("select").forEach(enhance);
  };

  const start = () => {
    scan(document);
    new MutationObserver((mutations) => {
      if (openInstance && !openInstance.root.isConnected) openInstance.close();
      for (const { addedNodes } of mutations) {
        addedNodes.forEach((node) => node.nodeType === 1 && scan(node));
      }
    }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  /**
   * Програмно виставити значення. Приймає value або видимий текст option
   * (без урахування регістру). Якщо збігу нема — вибирається плейсхолдер
   * (<option value="">), а за його відсутності — порожній стан.
   * Повертає true, якщо варіант знайдено.
   */
  const setValue = (select, newValue) => {
    const target = String(newValue ?? "")
      .trim()
      .toLowerCase();
    const options = [...select.options];

    const match =
      options.find((o) => o.value.toLowerCase() === target) ??
      options.find((o) => o.text.trim().toLowerCase() === target);

    const fallback = options.find((o) => o.value === "");
    const index = match?.index ?? fallback?.index ?? -1;

    // Перехоплений setter сам викличе sync() кастомного селекта
    select.selectedIndex = index;
    select.dispatchEvent(new Event("change"));

    if (!match)
      console.warn(`customSelect.set: немає варіанта "${newValue}"`, select);
    return Boolean(match);
  };

  window.customSelect = {
    refresh: (select) => registry.get(select)?.sync(),
    set: setValue,
  };
})();
