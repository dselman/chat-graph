import { PropsWithChildren } from 'react'
import { Flex, Layout } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";

type PageProps = {
}

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  backgroundColor: 'white',
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  backgroundColor: '#fff',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
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
          <h1>Chat with Graph</h1>
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
