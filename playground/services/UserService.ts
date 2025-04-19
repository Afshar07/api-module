export interface IExampleUser2 {
  mobile: string
  name: string
  id: number
}

export default class UserService {
  constructor(private httpClient: typeof useFetch) {}

  setUser(): Promise<AsyncData<IApiResult<IExampleUser>, IApiError>> {
    console.log(this.httpClient)
    // return this.httpClient('/Users/me', {
    // method: 'GET',
    // })
  }
}
