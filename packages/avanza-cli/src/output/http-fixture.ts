export interface HttpFixture {
  readonly request: {
    readonly body?: unknown;
    readonly method: string;
    readonly path: string;
  };
  readonly response: {
    readonly body: unknown;
    readonly status: number;
  };
}

export function recordFixture(
  enabled: boolean,
  fetch: typeof globalThis.fetch = globalThis.fetch,
): {
  readonly fetch: typeof globalThis.fetch;
  readonly latest: () => HttpFixture | undefined;
} {
  let fixture: HttpFixture | undefined;
  return {
    fetch: enabled
      ? async (input, init) => {
          const response = await fetch(input, init);
          if (response.headers.get('content-type')?.includes('json')) {
            try {
              const url = new URL(input instanceof Request ? input.url : input.toString());
              fixture = {
                request: {
                  ...(typeof init?.body === 'string'
                    ? { body: JSON.parse(init.body) as unknown }
                    : {}),
                  method: init?.method ?? (input instanceof Request ? input.method : 'GET'),
                  path: `${url.pathname}${url.search}`,
                },
                response: {
                  body: (await response.clone().json()) as unknown,
                  status: response.status,
                },
              };
            } catch {
              fixture = undefined;
            }
          } else {
            fixture = undefined;
          }
          return response;
        }
      : fetch,
    latest: () => fixture,
  };
}
