import { Avatar, Card, Skeleton } from "antd";
import Meta from "antd/es/card/Meta";

export default function LoadingChatMessage() {
    return (
        <><Card loading={true}>
            <Skeleton loading={true} avatar active>
                <Meta
                    avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=2" />}
                    title="Card title"
                    description="This is the description" />
            </Skeleton>
        </Card>
        </>
    );
}