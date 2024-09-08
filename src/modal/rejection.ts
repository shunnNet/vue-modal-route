import { RouteLocationRaw, Router } from 'vue-router'

export class Rejection {
  mode: 'replace' | 'push' = 'replace'
  router: Router
  route: RouteLocationRaw
  constructor(
    mode: 'replace' | 'push' = 'replace',
    router: Router,
    route: RouteLocationRaw,
  ) {
    this.mode = mode
    this.route = route
    this.router = router
  }

  run() {
    return this.router[this.mode](this.route)
  }

  static isRejection(value: any): value is Rejection {
    return value instanceof Rejection
  }
}
