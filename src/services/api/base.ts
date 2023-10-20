export default abstract class APIService {
  abstract areCredentialsValid(): Promise<boolean>;
}
