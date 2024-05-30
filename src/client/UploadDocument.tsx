import React, { useState } from "react";
import { Clause } from "../server/upload/types";
import { Document } from "../server/upload/types.js";
import { EventSourceParserStream } from "eventsource-parser/stream";
import { LogEventType } from "../server/upload/logger";
import { ReadMore } from "./ReadMore";
import DocumentEditor from "./DocumentEditor";

interface WaitState {
  step: string;
}

type FilterState = Record<string, boolean>;

const UploadDocument = () => {
  const [data, setData] = useState<Array<object>>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(false);
  const [waitState, setWaitState] = useState<Array<WaitState>>([]);

  const handleFileUpload = async (event: {
    target: { files: FileList | null };
  }) => {
    const file = event.target.files ? event.target.files[0] : undefined;
    console.log(file);
    if (!file) {
      return;
    }
    console.log(filters);
    try {
      setData([]);
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const params = new URLSearchParams();
      // Object.keys(filters).forEach((k) => {
      //   params.set(k, filters[k].toString());
      // });
      params.set('select-openai', 'true');
      const response = await fetch(`/api/upload?${params}`, {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
        },
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw response.statusText;
      }

      const eventStream = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream())
        .getReader();

      for (;;) {
        const { done, value } = await eventStream.read();
        if (done) {
          break;
        } else {
          try {
            const newData = JSON.parse(value.data);
            console.log(newData);
            setData((prevValue) => prevValue.concat([newData]));
            if (newData.type === LogEventType.WAITING) {
              setWaitState((prevValue) =>
                prevValue.concat([{ step: newData.step }])
              );
            } else {
              setWaitState((prevValue) =>
                prevValue.filter((w) => w.step !== newData.step)
              );
            }
          } catch (err) {
            console.log("Failed to parse JSON!");
            console.log(value.data);
            break;
          }
        }
      }
    } catch (error) {
      console.log(error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  function renderExtraction(clauses: Array<Clause>) {
    const rows = clauses.map((clause) => {
      return (
        <tr key={clause.number}>
          <td>{clause.documentId}</td>
          <td>{clause.number}</td>
          <td>{clause.type}</td>
          <td>{clause.description}</td>
          <td>{clause.promisor}</td>
          <td>{clause.promisee}</td>
          <td>{clause.promise}</td>
          <td>
            <ReadMore id={clause.number} text={clause.content} />
          </td>
        </tr>
      );
    });
    return (
      <table>
        <thead>
          <tr>
            <th>Document ID</th>
            <th>Clause #</th>
            <th>Type</th>
            <th>Description</th>
            <th>Promisor</th>
            <th>Promisee</th>
            <th>Promise</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  function renderDocument(document: Document) {
    console.log(JSON.stringify(document.slate.document.children, null, 2));
    return (
        <DocumentEditor initialValue={document.slate.document.children} />
    );
  }

  function renderItem(item: any, index: number) {
    if (
      item.step.endsWith("Parse_Clauses_From_Markdown") &&
      item.type === LogEventType.RESULT &&
      Array.isArray(item.message)
    ) {
      return <td>
        {renderExtraction(item.message)}
      </td>
    } else if (
      item.step === "Get_Document_Content" &&
      item.type === LogEventType.RESULT
    ) {
      return <td>
        {renderDocument(item.message)}
      </td>
    } else if (item.type === LogEventType.WAITING) {
      return <></>;
    } else {
      return (
        <td>
          {typeof item.message === "string" ? (
            <ReadMore id={`${item.step}-${index}`} text={item.message} />
          ) : (
            JSON.stringify(item.message)
          )}
        </td>
      );
    }
  }

  function filterHandler(event: any) {
    const { id } = event.target;
    setFilters((previousState) => {
      const newState = JSON.parse(JSON.stringify(previousState));
      newState[id] = !previousState[id];
      return newState;
    });
  }

  const dataTable = data.map((item: any, index) => {
    return (
      <tr key={index}>
        <td>{item.step}</td>
        <td>{item.type}</td>
        {renderItem(item, index)}
      </tr>
    );
  });
  return (
    <div>
      {/* <div>
        <label htmlFor="select-openai">OpenAI</label>
        <input
          id="select-openai"
          type="checkbox"
          value={filters["select-openai"] ? "true" : "false"}
          onChange={filterHandler}
          disabled={loading}
        />
        <label htmlFor="select-mistral">Mistral</label>
        <input
          id="select-mistral"
          type="checkbox"
          value={filters["select-mistral"] ? "true" : "false"}
          onChange={filterHandler}
          disabled={loading}
        />
        <label htmlFor="select-claude">Claude</label>
        <input
          id="select-claude"
          type="checkbox"
          value={filters["select-claude"] ? "true" : "false"}
          onChange={filterHandler}
          disabled={loading}
        />
      </div> */}
      <div>
        <label htmlFor="file-upload" className="custom-file-upload">
          Upload Document
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileUpload}
          disabled={loading}
        />
      </div>
      {dataTable.length > 0 && (
        <div>
          <h3>Activity Log</h3>
          <a
            className="pull-right btn btn-primary"
            style={{ margin: 10 }}
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(data, null, 2)
            )}`}
            download="data.json"
          >
            DOWNLOAD DATA AS JSON
          </a>
          <table className="roottable">
            <thead>
              <tr>
                <th style={{width: "20%" }}>Component</th>
                <th style={{width: "10%" }}>Event</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>{dataTable}</tbody>
          </table>
          <div>
            {waitState.length > 0 ? (
              <>
                <label htmlFor="progress-bar">
                  {waitState.map((w) => w.step).join()}:{" "}
                </label>
                <progress
                  id="progress-bar"
                  aria-label={waitState.map((w) => w.step).join()}
                ></progress>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocument;
