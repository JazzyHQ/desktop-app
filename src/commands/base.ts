export default abstract class ICommand<T> {
  context: T;

  constructor(input: T) {
    this.context = input;
  }

  // We have to define the name as a static and a non-static property
  // because we need to access it from the class and from the instance.
  // Not sure how to make it work with typescript any other way.
  abstract commandName: string;

  static commandName: string;
}
