import React, { useEffect, useRef } from "react";
import { SetStateAction, useState } from "react";
import { Button, Input, MessageList, MessageType } from "react-chat-elements"

/*
{
    position: "left",
    type: "text",
    title: "Kursat",
    text: "Give me a message list example !",
  },
  {
    position: "right",
    type: "text",
    title: "Emre",
    text: "That's all.",
  }
  */

type Tool = {
    function: {
        name: string;
        arguments: string;
    }
}

type Message = {
    role: 'user' | 'system' | 'assistant' | 'tool';
    content?: string;
    tool_calls?: Array<Tool>;
}

function transformMessages(messages: Array<Message>): Array<MessageType> {
    console.log(JSON.stringify(messages, null, 2));
    const nonSystem = messages.filter((m) => m.role !== 'system');
    return nonSystem.map((m) => {
        return {
            position: m.role === 'user' ? 'left' : 'right',
            title: m.role,
            type: 'text',
            titleColor: m.role === 'user' ? 'black' : 'red',
            text: m.content ? m.content : m.tool_calls ? m.tool_calls.map(t => `${t.function.name} with ${t.function.arguments}`).join() : ''
        } as MessageType;
    });
}

const DEFAULT_INPUT = "Is Leonardo DiCaprio old enough to be Margot Robbie’s father?";
export default function Chat() {
    const messageListReferance = null;
    const [messages, setMessages] = useState<Array<MessageType>>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/messages', {
            method: "GET",
            headers: {
                'Content-Type': "application/json",
                Accept: "application/json"
            }
        })
            .then((response) => {
                if (!response.ok || !response.body) {
                    alert(response.statusText);
                }
                response.json().then(sessionMessages => {
                    if (sessionMessages.messages) {
                        setMessages(transformMessages(sessionMessages.messages));
                    }
                })
            })
    }, []);

    const handleSubmit = async () => {
        if (!inputRef.current?.value) {
            return;
        }
        setMessages(prevArray => [...prevArray, {
            position: 'left',
            title: 'user',
            type: 'text',
            text: inputRef.current?.value
        } as MessageType])

        const response = await fetch('/api/chat', {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({ message: inputRef.current?.value }),
        });

        if (!response.ok || !response.body) {
            alert(response.statusText);
        }

        const newMessages = await response.json();
        if (newMessages.messages) {
            setMessages(transformMessages(newMessages.messages));
        }
    };

    return (
        <div className="chat">
            <MessageList
                referance={messageListReferance}
                className='message-list'
                lockable={true}
                toBottomHeight={'100%'}
                dataSource={messages}
            />
            <input className="chat-input"
                ref={inputRef}
                defaultValue={DEFAULT_INPUT}
                type="textarea"
                placeholder="Type here..."
            /><Button text={"Send"} onClick={handleSubmit} title="Send" />
        </div>
    );
}
