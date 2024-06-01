import { PropsWithChildren } from 'react'
import { Flex, Layout } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Title from 'antd/es/typography/Title';

type PageProps = {
}

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: 'white',
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  backgroundColor: '#fff',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#FF5252',
};

const layoutStyle = {
  borderRadius: 8,
};

const title = "Chat with Graph";

export default function Page(props: PropsWithChildren<PageProps>) {
  return (
    <Flex gap="middle" wrap>
      <Layout style={layoutStyle}>
        <Header style={headerStyle}>
          <Title>Chat with Graph</Title>
        </Header>
        <Content style={contentStyle}>{props.children}
        </Content>
        <br/>
        <Footer style={footerStyle}>
          Made with ❤️ by <a href="https://github.com/dselman">Dan Selman</a><br />
        </Footer>
      </Layout>
    </Flex>
  );
}
