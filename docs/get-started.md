# Getting Started with $render

$render makes JSX possible in the browser without a virtual DOM. $render JavaScript components with the speed of light in script tags, and esModules.

It's intuitive, super fast and flexible.

#### Installation

You can check out [LovePlay music player](https://codingnninja.github.io/lovePlay) if you want to see $render in action with script tags in the real world. It even has swiping and downloading capability.

    ### Add $render with a script.

    ```html copy
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="root"></div>

        <script src="https://cdn.jsdelivr.net/npm/@codingnninja/render/dist/umd/bundle.min.js"></script>
      </body>
    </html>
    ```

    ### Add JSX

    * Add JSX inline
    ```html {6,10-14} copy
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div id="root"></div>
        <script src="https://cdn.jsdelivr.net/npm/@codingnninja/render/dist/umd/bundle.min.js"></script>
        <script>
          const { $render } = render;
          const Counter = (count = 0) => {
            return `
              <div id="counter">
                <button
                  onClick="$render(Counter, ${count + 1})"
                  style="height:30px; width:100px">Count is ${count}
                </button>
              </div>
            `;
          };
          $render(Counter);
        </script>
      </body>
    </html>
    ```
    * Count live

<iframe src="https://codesandbox.io/embed/ggjrqp?view=preview&module=%2Findex.html&hidenavigation=1"
     width="100%"
     title="counter"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
> </iframe>

    * Add JSX via a link (app.js)
    ```html copy
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="root"></div>
        <script src="https://cdn.jsdelivr.net/npm/@codingnninja/render/dist/umd/bundle.min.js"></script>
        <script src="app.js"></script>
      </body>
    </html>
    ```

    `app.js` content:

    ```js {1,6-10} copy
    const {$render} = render;

    const Counter = (count = 0) => {
      return `
        <div id="counter">
          <button
            onClick="$render(Counter, ${count + 1})"
            style="height:30px; width:100px">Count is ${count}
          </button>
        </div>
      `;
    };
    $render(Counter);
    ```

### Scaffold $render project.

```bash copy
npx create-render-app music-player
```

    Note: since $render is similar to React, this is to remind you to never scaffold your `React` application with `create-react-app`; use `Remix` or `Next` instead.


    ### Change directory to the project.

```bash copy
cd music-player
```

    ### Run local server.

```bash copy
npm run dev
```

      ### Install $render with npm.
    ```bash copy
    npm i @codingnninja/render
    ```

      ### import $render in your project.
    ```bash copy
    import {$render, stringify} from '@codingnninja/render'
    ```
