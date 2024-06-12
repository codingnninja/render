import { $render, $register, stringify } from "../../src/render";
describe('Render a component', function() {
  it('should render a component when the component name starts with an uppercase letter', async () => {
      const component = function MyComponent(props) {
        return `<div>Hello, ${props.name}!</div>`;
      };

      $register(component);
      const props = { name: 'John' };
      const result = await $render(component, props);

      expect(result).toEqual('<div>Hello, John!</div>');
  });

  it('should process JSX', async () => {
      const JSX = () => '<div>JSX</div>';
      function AnotherOne(props) {
        return `
          <div>
            Hello, ${props.name}!
            <JSX />
          </div>`;
      };

      $register(stringify, AnotherOne, JSX);
      const props = { name: 'John' };
      const result = await $render(AnotherOne, props);
      console.log(result)
      expect(result).toEqual( `<div>            Hello, John!            <div>JSX</div></div>`);
  });

  it('should process JSX with props', async () => {
    function MyProps (props) {
      return `<div onclick={ props } >JSX </div>`;
    }

    function MyTest(props) {
      return `
        <div>
          Hello, ${props.name}!
          <MyProps props="{props}" />
        </div>
      `;
    };

    $register(stringify, MyTest, MyProps);
    const props = { name: 'John' };
    const result = await $render(MyTest, props);
    expect(result).toEqual( `<div>            Hello, John!            <div>JSX, John </div></div>`);
  });

  it('should throw an error when the component name does not start with an uppercase letter', async () => {
      function myComponent(props) {
          return `<div>Hello, ${props.name}!</div>`;
      };

      $register(myComponent);
      const props = { name: 'John' };
      expect(await $render(globalThis._myComponent, props)).rejects.toThrow('A component must start with a capital letter.');
  });
});