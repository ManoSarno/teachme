import { useState } from "react"
import { ItemSuggestion } from "./components/ItemSuggestion"
import { getHistoric, setHistoric } from "./storage/historic";
import { sendMessage } from "./api/groq";
import { Message } from "./api/groq";
import { ThreeDots } from "react-loader-spinner";
import questionMark from "./assets/question.svg";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";

type ProgressType = 'pending' | 'started' | 'done';

function App() {
  const [open, setOpen] = useState<boolean>(false);
  // pending -> started -> done
  const [progress, setProgress] = useState<ProgressType>('pending');
  const [textarea, setTextarea] = useState<string>('');
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const suggestions = ['HTML', 'CSS', 'JavaScript', 'TypeScript'];

  function resetChat() {
    setProgress('pending');
    setChat([]);
  }

  async function handleSubmitChat() {
    if(!textarea) {
      return;
    }

    const message = textarea;
    setTextarea('');

    if(progress === 'pending') {  
      // add user theme to historic 
      setHistoric(message);

      // set progress to started, so it can change layout
      setProgress('started');

      // prompt for openai
      const prompt = `Gere uma pergunta onde simule uma entrevista de emprego sobre ${message}. Após gerar a pergunta, enviarei a resposta e você me dará um feedback, explicando o certo caso a resposta estiver errada. O feedback precisa ser simples, objetivo e corresponder fielmente à resposta enviada. Após o feedback, não existirá mais interação. Por favor, formate sua resposta como texto e se houver listas, separe elas com enter.`;
      
      // creating object for the prompt message
      const messageGPT: Message = {
        role: "user",
        content: prompt,
        subject: message
      }

      // add user theme question to array
      setChat(text => [...text, messageGPT]);
      
      // set loading true so the loader-spinner will appear
      setLoading(true);

      // await response from openai api for the question
      const questionGPT: Message = await sendMessage([messageGPT]) as Message;
      
      // add the question to array
      setChat(text => [...text, { role: "assistant", content: questionGPT.content }]);
      
      // set loading false so the loader-spinner will disappear
      setLoading(false);

      return;
    }
    
    // creating object for the user response
    const responseUser: Message = {
      role: "user",
      content: message
    }
    
    // add user response to array
    setChat(text => [...text, responseUser]);

    // set loading true so the loader-spinner will appear
    setLoading(true);

    // await response from openai api for the feedback
    const feedbackGPT: Message = await sendMessage([...chat, responseUser]) as Message;

    // add the feedback to array
    setChat(text => [...text, { role: "assistant", content: feedbackGPT.content }]);
    
    // set loading false so the loader-spinner will disappear
    setLoading(false);

    // set progress to done, so it can restart layout
    setProgress('done');
  }

  return (
    <div className="container">
      {open ? (
        <HiOutlineX className="icon-menu" onClick={() => setOpen(false)}/>
      ) : (
        <HiOutlineMenuAlt3 className="icon-menu" onClick={() => setOpen(true)}/>
      )}
      <div className={`sidebar ${open ? 'active' : 'inactive'}`}>
        <details open className="suggestion">
          <summary>
            Tópicos sugeridos
          </summary>
          
          {suggestions.map((suggestion, index) => (
            <ItemSuggestion key={`suggestion-${index}`} title={suggestion} onClick={() => setTextarea(suggestion)}/>
          ))}

        </details>

        <details open className="history">
          <summary>
            Histórico
          </summary>

          {getHistoric().map((item, index) => (
            <ItemSuggestion key={`historic-${index}`} title={item} onClick={() => setTextarea(item)}/>
          ))}

        </details>
      </div>

      <div className="content">
        {progress === 'pending' ? (
          <div className="box-home">
            <span>Olá, eu sou o</span>
            <h1>teach<span>.me</span></h1>
            <p>
              Estou aqui para te ajudar nos seus estudos.
              Selecione um dos tópicos sugeridos ao lado
              ou digite um tópico que deseja estudar para
              começarmos.
            </p>
          </div>
        ) : (
          <div className="box-chat">
            {chat[0] && (
              <h1>Você está estudando sobre <span>{chat[0].subject}</span></h1>
            )}

            {chat[1] && (
              <div className="question">
                <h2>
                  <img src={questionMark} alt="Ícone de interrogação"/>
                  Pergunta
                </h2>
                <p>
                  {chat[1].content}
                </p>
              </div>
            )}

            {chat[2] && (
              <div className="answer">
                <h2>Sua Resposta</h2>
                <p>
                  {chat[2].content}
                </p>
              </div>
            )}

            {chat[3] && (
              <div className="feedback">
                <h2>Feedback teach<span>.me</span></h2>
                <p>
                  {chat[3].content}
                </p>
                <div className="actions">
                  <button onClick={resetChat}>Estudar novo tópico</button>
                </div>
              </div>
            )}

            <ThreeDots
              visible={loading}
              height="30"
              width="60"
              color="#d6409f"
              radius="9"
              ariaLabel="three-dots-loading"
              wrapperStyle={{ margin: '30px auto' }}
            />
          </div>
        )}

        {progress !== 'done' && (
          <div className="box-input">
            <textarea
              value={textarea}
              onChange={(e) => setTextarea(e.target.value)}
              placeholder={progress === 'started' ? "Insira sua resposta..." : "Insira o tema que deseja estudar..."}
            />
            <button onClick={handleSubmitChat}>{progress === 'pending' ? 'Enviar Pergunta' : 'Enviar Resposta'}</button>
          </div>
        )}

        <div className="box-footer">
          <p>teach<span>.me</span></p>
        </div>
      </div>
    </div>
  )
}

export default App
