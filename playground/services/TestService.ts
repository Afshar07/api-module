export default class TestService {
  constructor(private httpClient: typeof useFetch) {}

  callMe() {
    return new Promise((resolve, _) => {
      console.log(this.httpClient)
      setTimeout(() => {
        resolve('HI')
      }, 700)
    })
  }
}
