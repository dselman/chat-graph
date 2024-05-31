import { PropsWithChildren } from 'react'
import { Flex, Layout } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";

type PageProps = {
}

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 48,
  lineHeight: '64px',
  backgroundColor: '#4096ff',
  fontSize: '3.2em'
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  // minHeight: 120,
  // lineHeight: '120px',
  // color: '#fff',
  // backgroundColor: '#0958d9',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#4096ff',
};

const layoutStyle = {
  borderRadius: 8,
  overflow: 'hidden',
};

const title = "Chat with Graph";

export default function Page(props: PropsWithChildren<PageProps>) {
  return (
    <Flex gap="middle" wrap>
      <Layout style={layoutStyle}>
        <Header style={headerStyle}>{title}</Header>
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
