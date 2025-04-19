export default class amir {
  constructor(private httpClient: typeof useFetch) {}

  SAYMYNAME() {
    return new Promise((resolve, _) => {
      console.log(this.httpClient)
      setTimeout(() => {
        resolve('HI')
      }, 700)
    })
  }
}
