export interface IExampleUser {
  mobile: string
  name: string
  id: number
}

export default class BlogService {
  constructor(private httpClient: typeof useFetch) {}

  getUser(): Promise<AsyncData<IApiResult<IExampleUser>, IApiError>> {
    return this.httpClient('/Users/me', {
      method: 'GET',
    })
  }
}
