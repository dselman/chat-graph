import { PropsWithChildren } from 'react'

type PageProps = {
}

const title = "Chat with Graph";

export default function Page(props: PropsWithChildren<PageProps>) {
  return (
    <>
      <header>
      <h1>{title}</h1>
      </header>

      <main>
        {props.children}
      </main>

      <footer>
        Made with ❤️ by <a href="https://github.com/dselman">Dan Selman</a>. <br/>
      </footer>
    </>
  );
}
