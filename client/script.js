import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNum = Math.random();
  const hexadecString = randomNum.toString(16);

  return `id-${timestamp}-${hexadecString}`;
}

function chatStripe(isAI, value, uniqueID) {
  return `
    <div class="wrapper ${isAI ? 'AI' : ''}">
      <div class="chat">
        <div class="profile">
          <img src="${isAI ? bot : user}" />
        </div>
        <div class="message" id="${uniqueID}">
          ${value}
        </div>
      </div>
    </div>
  `;
}

const typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  form.reset();

  // Display user's message
  const userMessage = data.get('prompt');
  const userMessageId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(false, userMessage, userMessageId);

  // Display bot's message
  const botMessageId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', botMessageId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(botMessageId);

  loader(messageDiv);

  try {
    const response = await fetch('http://localhost:5000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: userMessage,
      }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim();

      typeText(messageDiv, parsedData);
    } else {
      const err = await response.text();
      console.log(err);

      messageDiv.innerHTML = 'Something went wrong';
    }
  } catch (error) {
    console.log(error);

    messageDiv.innerHTML = 'Something went wrong';
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
