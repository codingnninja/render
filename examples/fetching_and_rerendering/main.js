import { $render, $register, $select } from "../../dist/esm/render.min.js";

// const { $render, $register, stringify, $select, $purify } = render;
const audioURL = '';

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

  const state = {
    images,
    audioURL,
    memoize,
    play,
    pause,
    setVolume
  }

  function App(props) {
    return `
        <div id="app" style="color: #000;" class="hide">
          <Counter />
          <Home images={props.images} />
          <Others props="{props}" />
          <Defer id="users" props="{props}" component="Users" />
        </div>
      `;
    }

    export function Defer({id, component, props}){
      return `
        <div id="${id}" data-render="defer">
          <img src="https://cdn.pixabay.com/animation/2023/08/11/21/18/21-18-05-265_512.gif" style="width:32px" loading="lazy"> loading...
          <iframe onload="$render(${component}, '${stringify(props)}')" height="0"></iframe>
        </div>
      `;
    }

  const Home = ({images}) => {
    const test = {
      student:{
        names:{
          first:"ayo"
        }
      }
    }

    return` 
      <div id="page">
        <Gallary> 
          <CurrentImage 
            src={images[0].src} 
            alt={images[0].alt}
            yes={test}
          />
          <Pagination images="{images}" />
        </Gallary>
      </div>
    `
  }
  const Others = ({props}) => {
    const {images, audioURL, memoize, play, pause, setVolume} = props;
    return` 
      <div id="page">
        <AudioPlayer
          images={images} 
          audioUrl="${audioURL}"
          play=${play}
          pause="${pause}"
          setVolume="${setVolume}"  
        />
        <button onClick="$trigger(${memoize})">alert</button>
      </div>
    `
  }

  const Counter = (count=0) => {
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
    const Pagination = ({images}) => {
      const listItems = images.map((image, key) => {
        return `
        <div id="${key}">
          <img
            onClick="$render(CurrentImage, {image})"
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
    const CurrentImage = ({src, alt, yes}) => {
      return `
        <div id="current-image">
          <img class="h-auto max-w-full rounded-lg" src="${src}" alt="${alt}">
        </div>
      `;  
    }

  function AudioStatus(msg) {return `<div id="audioStatus" class="bg-indigo-800 text-white">${msg}</div>`;}
  function play (audio, url){
    //jssk
    /* */
    audio.play();
    $render(AudioStatus, 'Playing');
  };
  function pause (audio, url){
    audio.pause();
    $render(AudioStatus, 'Paused');
  }

  function setVolume(elements){ return elements[0].volume = elements[1].value;}
  function AudioPlayer({images,audioUrl, play, pause, setVolume}) {
    return  `
      <audio src="${audioUrl}" id="myAudio"></audio>
      <button 
        onClick="$trigger({play}, '#myAudio', {images})" class="m-3">Play Audio </button> 
      <button 
        onClick="$trigger({pause}, '#myAudio')"> Pause Audio </button>
      <input type="range" id="volume" min="0" max="1" step="0.01" value="1"
        onChange="$trigger(${setVolume}, '#myAudio, #volume')">
      <p id="audioStatus" class="text-center"></p>
    `;
  }

const Users = async (props) => {
  const images = {props};
  const response = await fetch("https://randomuser.me/api?results=30");
  const users = await response.json();

  return `
      <div id="users" data-append="#list">
        <h1 class="text-3xl">User list</h1>
        <ul class="list" id="list">
          ${users.results.map((user) => {
            return `
                <li class="item">
                  <img src="${user.picture.medium}" loading="lazy">
                  <p class="name">${user.name.first}</p>
                </li>
              `;
          })}
          </ul>
          <button 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-5"
            onClick="$render(Users, {props})">Load more users...</button>
      </div>
    `;
};

/* const Animal = (options = {returnData: false}) => {
  function View(goats = []){
    return `
      <div id="animal" data-replace="#animal-list">
        <h1 class="text-3xl">Animal list</h1>
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
}; */

console.log($select('.post[0], .post[add|class=rubbish]'))
console.log($select('.post:not(#e3)'))
console.log($select('.post[filterOut|id=e3]'))

const start = performance.now();

  console.log($select(`
    .post[id~=e3],
    .post:not(#e3),
    .post[delete|id=e3]
  `));

// const end = performance.now();
// const duration = end - start;
// console.log(duration);




  
  $register(
    Users,
    Home,
    Others,
    Defer,
    Counter, 
    Gallary, 
    Pagination, 
    CurrentImage, 
    AudioStatus, 
    AudioPlayer
  );

  const starta = performance.now();
  const a = await $render(App, state);

const end = performance.now();

const duration = end - starta;
console.log(duration);

// console.log(a)