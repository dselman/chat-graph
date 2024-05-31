import { Avatar, Card } from "antd";
import Meta from "antd/es/card/Meta";
import Markdown from 'react-markdown'

export interface ChatMessageProps {
    position: 'left' | 'right';
    title: string;
    text: string;
    color?: string;
}
export default function ChatMessage({ position, color = "white", text, title }: ChatMessageProps) {
    const avatarSrc = title === 'Question' ? 'https://api.dicebear.com/8.x/personas/svg?seed=Kiki' : 'https://api.dicebear.com/8.x/bottts/svg?seed=Whiskers';
    return (
        <Card style={{ backgroundColor: color, marginLeft: position === 'left' ? '0px' : '200px' }}>
            <Meta
                avatar={<Avatar src={avatarSrc} />}
                title={title}
                description={<Markdown>{text}</Markdown>}
            />
        </Card>
    );
}