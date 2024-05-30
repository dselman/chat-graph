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

type Role = 'user' | 'system' | 'assistant' | 'tool';
type Message = {
    role: Role;
    content?: string;
    tool_calls?: Array<Tool>;
}

function getColor(role: Role, content?: string) {
    switch (role) {
        case 'user':
            return 'black';
        case 'assistant':
            return content ? 'blue' : 'grey';
        case 'tool':
            return 'grey';
        default:
            return 'black';
    }
}

function getTitle(role: Role, content?: string) {
    switch (role) {
        case 'user':
            return 'Question';
        case 'assistant':
            return content ? 'Answer' : 'Tool Request';
        case 'tool':
            return 'Tool Response';
        default:
            return 'Other';
    }
}

function transformMessages(messages: Array<Message>): Array<MessageType> {
    const nonSystem = messages.filter((m) => m.role !== 'system');
    return nonSystem.map((m) => {
        return {
            position: m.role === 'user' ? 'left' : 'right',
            title: getTitle(m.role, m.content),
            type: 'text',
            titleColor: getColor(m.role, m.content),
            text: m.content ? m.content : m.tool_calls ? m.tool_calls.map(t => `${t.function.name} with ${t.function.arguments}`).join(' and ') : ''
        } as MessageType;
    });
}

const DEFAULT_INPUT = "Is Leonardo DiCaprio old enough to be Margot Robbie’s father?";
export default function Chat() {
    const messageListReferance = null;
    const [messages, setMessages] = useState<Array<MessageType>>([]);

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

    const handleSubmit = async (e: any | undefined) => {
        if (!e) {
            return;
        }
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        // Or you can work with it as a plain object:
        const formJson = Object.fromEntries(formData.entries());

        setMessages(prevArray => [...prevArray, {
            position: 'left',
            title: 'user',
            type: 'text',
            text: formJson.chatInput
        } as MessageType])

        const response = await fetch('/api/chat', {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({ message: formJson.chatInput }),
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
            <form method="post" onSubmit={handleSubmit}>
                <textarea
                    name="chatInput"
                    defaultValue={DEFAULT_INPUT}
                    rows={4}
                    cols={40}
                />
                <br/>
                <button type="submit">Send</button>
            </form>
        </div>
    );
}
