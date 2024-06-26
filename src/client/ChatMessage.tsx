import { Avatar, Card, Space } from "antd";
import Meta from "antd/es/card/Meta";
import Paragraph from "antd/es/typography/Paragraph";
import { useState } from "react";
import Markdown from 'react-markdown'

export interface ChatMessageProps {
    position: 'left' | 'right';
    title: string;
    text: string;
    color?: string;
    logMessage?: string;
}
export default function ChatMessage({ logMessage, position, color = "white", text, title }: ChatMessageProps) {
    const avatarSrc = title === 'Question' ? 'https://api.dicebear.com/8.x/adventurer/svg?seed=Missy' : 'https://api.dicebear.com/8.x/bottts/svg?seed=Whiskers';
    const description = position === 'left' ? <Markdown>{text}</Markdown> : <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
        {text}
    </Paragraph>;

    const pre = logMessage ? <Card style={{ backgroundColor: 'lightgreen', marginLeft: '10%' }}>
        <Meta
            avatar={<Avatar src={avatarSrc} />}
            title="Generated Query"
            description={logMessage}
        />
    </Card> : <></>;

    return (<Space direction="vertical" size={16}>
        {pre}
        <Card style={{ backgroundColor: color, marginLeft: position === 'left' ? '0%' : '10%' }}>
            <Meta
                avatar={<Avatar src={avatarSrc} />}
                title={title}
                description={description}
            />
        </Card>
    </Space>);
}