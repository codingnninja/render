import { $render, $register, stringify, $select, $purify } from "../dist/esm/bundle.js";
const audioURL = 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3';

const images = [
    {src:"https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg", alt:"Ayoba_mope", mo:{y:[{o:'ayo'}]}, age:40},
    {src: "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg", alt:""},
    {src: "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg", alt:""},
    {src: "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg", alt:""},
    {src: "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg", alt:""},
    {src: "https://flowbite.s3.amazonaws.com/docs/gallery/featured/image.jpg", alt:""}
  ];

  const deeplyNested = [
    {
      label: "first",
      id: 1,
      children: []
    },
    {
      label: "second",
      id: 2,
      children: [
        {
          label: "third",
          id: 3,
          children: [
            {
              label: "fifth",
              id: 5,
              children: []
            },
            {
              label: "sixth",
              id: 6,
              children: [
                {
                  label: "seventh",
                  id: 7,
                  children: []
                }
              ]
            }
          ]
        },
        {
          label: "fourth",
          id: 4,
          children: []
        }
      ]
    }
  ];

  function memoize() {
    alert('working');
  }
  function App(memoize) {
      return `
        <div id="app" style="color: #000;" class="hide">
          <Counter />
          <Users />
          <Gallary> 
            <CurrentImage image=${stringify(images[0])} />
            <Pagination images=${stringify(images)} />
            <AudioPlayer audioUrl=${stringify(audioURL)} />
          </Gallary>
          <Animal />
          <button onClick="$trigger(${memoize})">alert</button>
        </div>
      `;
    }
    const Counter = (count = 0) => {
      return `
        <div id="counter">
          <div>${count}</div>
          <button 
            onClick="$render(Counter, ${count + 1})" 
            style="height:30px; width:50px">Increase
          </button>
        </div>
      `;
    };
    
    const Gallary = ({children}) => {
      return `
        <div 
          class="grid gap-4"
          id="gallary">
          ${children}
        </div>`;
    }
    const Pagination = (images) => {
      const listItems = images.map((image, key) => {
        return `
        <div id="${key}">
          <img
            onClick="$render(CurrentImage, '${stringify(image)}')"
            class="h-auto max-w-full rounded-lg" 
            src="${image.src}"
          />
        </div>
      `});
      
      return `
        <div 
          class="grid grid-cols-5 gap-4"
          id="pagination">
          ${listItems}
        </div>
      `;
    }
    const CurrentImage = ({src='url' , alt='student'} = {}) => {
      return `
        <div id="current-image">
          <img class="h-auto max-w-full rounded-lg" src="${src}" alt="${alt}">
        </div>
      `;  
    }

  const AudioStatus = (msg) => `<div id="audioStatus" class="bg-indigo-800 text-white">${msg}</div>`;
  const play = (audio, url) => {
    audio.play();
    $render(AudioStatus, 'Playing');
  };
  const pause = (audio, url) => {
    audio.pause();
    $render(AudioStatus, 'Paused');
  }

  const setVolume = (elements => elements[0].volume = elements[1].value);
  function AudioPlayer(audioUrl) {
    return  `
      <audio src="${audioUrl}" id="myAudio"></audio>
      <button 
        onClick="$trigger(${play}, '#myAudio')" class="m-3">Play Audio </button> 
      <button 
        onClick="$trigger(${pause}, '#myAudio')"> Pause Audio </button>
      <input type="range" id="volume" min="0" max="1" step="0.01" value="1"
        onChange="$trigger(${setVolume}, '#myAudio, #volume')">
      <p id="audioStatus" class="text-center"></p>
    `;
  }

    const Users = (options = {returnData: false}) => {
      function View(users = []) {
        return `
          <div id="users" data-append="#list">
            <h1>User list</h1>
            <ul class="list" id="list">
              ${users.results.map((user) => {
                return `
                    <li class="item">
                      <img src="${user.picture.medium}">
                      <p class="name">${user.name.first}</p>
                    </li>
                  `;
              })}
              </ul>
              <button 
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-5"
                onClick="$render(Users, '${stringify(options)}')">Load more users...</button>
          </div>
        `;
      }

      const runModel = async (options) => {
        const response = await fetch("https://randomuser.me/api?results=30");
        const users = await response.json();
        return options.returnData ? users : $render(View, users);
      };
      return runModel(options);
    };

  const Animal = (options = {returnData: false}) => {
    function View(goats = []){
      return `
        <div id="animal" data-append="#animal-list">
          <h1>User list</h1>
          <ul class="list" id="animal-list">
            ${goats.results.map((goat) => {
              return `
                <li class="item">
                  <img src="${goat.picture.medium}">
                  <p class="name">${goat.name.first}</p>
                </li>
              `;
            })}
          </ul>
          <button 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-5"
            onClick="$render(Animal, '${stringify(options)}')">Load more animal...</button>
        </div>
      `;
    }

    const runModel = async (options) => {
      const goats = await Users({returnData:true});
      return options.returnData ? goats : $render(View, goats);
    };
    return runModel(options);
  };
  
  $register(
    Users,
    Animal,
    Counter, 
    Gallary, 
    Pagination, 
    CurrentImage, 
    AudioStatus, 
    AudioPlayer
  );

  $render(App, memoize);