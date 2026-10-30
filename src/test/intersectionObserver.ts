// fallow-ignore-file unused-class-member -- members implement the DOM IntersectionObserver interface; components call them through it
// jsdom has no IntersectionObserver. This one records what each instance
// observes so a test can decide which elements "enter" the viewport.
export class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds = [];
  readonly scrollMargin = "";
  readonly callback: IntersectionObserverCallback;
  readonly targets = new Set<Element>();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? "";
    MockIntersectionObserver.instances.push(this);
  }

  observe = (target: Element) => {
    this.targets.add(target);
  };
  unobserve = (target: Element) => {
    this.targets.delete(target);
  };
  disconnect = () => {
    this.targets.clear();
  };
  takeRecords = () => [];

  static reset() {
    MockIntersectionObserver.instances = [];
  }

  // Report `target` as intersecting to every observer watching it
  static enter(target: Element) {
    for (const observer of MockIntersectionObserver.instances) {
      if (!observer.targets.has(target)) continue;
      const entry = { target, isIntersecting: true } as IntersectionObserverEntry;
      observer.callback([entry], observer);
    }
  }
}
