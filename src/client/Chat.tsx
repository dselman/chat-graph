import { useEffect, useState } from "react";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import { Space } from 'antd';
import LoadingChatMessage from "./LoadingChatMessage";
import TextArea from "antd/es/input/TextArea";
import { Button, Form } from 'antd';
import type { FormProps } from 'antd';

type Tool = {
    function: {
        name: string;
        arguments: string;
    }
}

type LogMessage = {
    level: 'log' | 'info' | 'success' | 'warn' | 'error',
    message: any;
    optionalParams: any[];
}

type Role = 'user' | 'system' | 'assistant' | 'tool';
type Message = {
    role: Role;
    content?: string;
    tool_calls?: Array<Tool>;
    logMessages: Array<LogMessage>;
}

const ecru = '#F8F3F0';
const poppy = '#FF5252';
const mist = '#CBC2FF';

type FieldType = {
    chatInput?: string;
};

function getColor(role: Role, content?: string) {
    switch (role) {
        case 'user':
            return 'white';
        case 'assistant':
            return content ? ecru : mist;
        case 'tool':
            return mist;
        default:
            return mist;
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

function transformLogMessages(messages?:Array<LogMessage>) {
    const result = messages ? messages.map( m => {
        return m.message.toString();
    }).join(', ') : '';
    return result.length > 256 ? `${result.substring(0,255)}...` : result;
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
            text: transformContent(m.content ? m.content : m.tool_calls ? m.tool_calls.map(t => `${t.function.name} with ${t.function.arguments}`).join(' and ') : ''),
            logMessage: transformLogMessages(m.logMessages)
        };
    });
}

const WELCOME_MESSAGE:ChatMessageProps = {
    position: "left",
    title: "Answer",
    text: 'Beep boop. I am a useful robot here to help you answer questions related to the data stored in a knowledge graph.'
};

export default function Chat() {
    const [messages, setMessages] = useState<Array<ChatMessageProps>>([WELCOME_MESSAGE]);
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
                    alert(`Failed! ${response.statusText}`);
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

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        alert(`Failed: ${errorInfo}`);
    };

    const handleReset = async() => {
        try {
            setLoading(true);
            const response = await fetch('/api/reset', {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    Accept: "application/json"
                },
            });

            if (!response.ok || !response.body) {
                alert(`Failed! ${response.statusText}`);
            }

            const newMessages = await response.json();
            if (newMessages.messages) {
                setMessages([WELCOME_MESSAGE]);
            }
        }
        finally {
            setLoading(false);
        }
    }

    const handleSubmit: FormProps<FieldType>['onFinish'] = async (formJson) => {
        console.log(formJson);
        if (!formJson.chatInput) {
            return;
        }
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
                alert(`Failed! ${response.statusText}`);
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
        chatMessages.push(<LoadingChatMessage key={-1}/>);
    }

    return (
        <div className="chat">
            <Space direction="vertical" size={16}>
                {chatMessages}
                <Form
                    name="chat"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item<FieldType>
                        name="chatInput"
                        rules={[{ required: true, message: 'Please enter a question.' }]}
                    >
                        <TextArea cols={10} rows={4} style={{width: '100%'}} placeholder="Enter a question..." />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" disabled={loading}>
                            Submit
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="reset" disabled={loading} onClick={handleReset}>
                            Reset
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </div>
    );
}
