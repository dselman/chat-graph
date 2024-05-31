import { useEffect, useState } from "react";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import { Button, Space } from 'antd';
import LoadingChatMessage from "./LoadingChatMessage";
import TextArea from "antd/es/input/TextArea";

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
            return 'lightgreen';
        case 'assistant':
            return content ? 'lightgreen' : 'lightgrey';
        case 'tool':
            return 'grey';
        default:
            return 'grey';
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

function transformContent(content: string) {
    try {
        const json = JSON.parse(content);
        const result = typeof json === 'string' ? json : content;
        return result;
    }
    catch (err) {
        return content;
    }
}

function transformMessages(messages: Array<Message>): Array<ChatMessageProps> {
    const nonSystem = messages.filter((m) => m.role !== 'system');
    return nonSystem.map((m) => {
        const title = getTitle(m.role, m.content);
        return {
            position: title === 'Question' || title === 'Answer' ? 'left' : 'right',
            title,
            type: 'text',
            color: getColor(m.role, m.content),
            text: transformContent(m.content ? m.content : m.tool_calls ? m.tool_calls.map(t => `${t.function.name} with ${t.function.arguments}`).join(' and ') : '')
        };
    });
}

const DEFAULT_INPUT = "Is Leonardo DiCaprio old enough to be Margot Robbie’s father?";
export default function Chat() {
    const [messages, setMessages] = useState<Array<ChatMessageProps>>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
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
            .finally(() => {
                setLoading(false);
            });
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
            title: 'Question',
            text: transformContent(formJson.chatInput.toString())
        }])

        try {
            setLoading(true);
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
        }
        finally {
            setLoading(false);
        }
    };

    const chatMessages = messages.map((m, index) => {
        return <ChatMessage key={index} {...m} />
    })

    if (loading) {
        chatMessages.push(<LoadingChatMessage />);
    }

    return (
        <div className="chat">
            <Space direction="vertical" size={16}>
                {chatMessages}
                <form method="post" onSubmit={handleSubmit}>
                    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                        <TextArea name="chatInput" rows={4} placeholder="Enter a question..." />
                        <Button disabled={loading} type="primary" htmlType="submit">Submit</Button>
                    </Space>
                </form>
            </Space>
        </div>
    );
}
