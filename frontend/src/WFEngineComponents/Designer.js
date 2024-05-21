import { useRef, useState } from "react"
import settings from "../settings";
import { Container } from "rsuite";
import SchemeMenu from "./SchemeMenu";
import ProcessMenu from "./ProcessMenu";
import WorkflowDesigner from "@optimajet/workflow-designer-react";

const Designer = (props) => {
    const {schemeCode, ...otherProps} = {props};
    const [code, setCode] = useState(props.schemeCode);
    const [processId, setProcessId] = useState(props.processId);
    const designerRef = useRef();

    const designerConfig = {
        renderTo: 'wfdesigner',
        apiurl: settings.designerUrl,
        templatefolder:'/templates/',
        widthDiff: 300,
        heightDiff: 100,
        showSaveButton: !processId
    };

    const createOrLoad = (code) => {
        setCode(code);
        setProcessId(null);
        const data = {
            schemeCode: code,
            processId: undefined
        };

        const wfDesigner = designerRef.current.innerDesigner;
        if (wfDesigner.exists(data)) {
            wfDesigner.load(data);
        } else {
            wfDesigner.create(code);
        }
    };

    const refrestDesigner = () => {
        designerRef.current.loadScheme();
    };

    const onCreateProcess = () => {
        fetch(`${settings.workflowUrl}/createInstance/${code}`)
            .then(result => result.json())
            .then(data => {
                setProcessId(data.id);
                const params = {
                    schemeCode: code,
                    processId: data.id
                };
                designerRef.current.innerDesigner.load(params, 
                    () => console.log('Process loaded'),
                    error => console.error(error)
                );
        });
    };

    return (
        <Container style={{maxWidth: '80%', overflow: 'hidden'}}>
            {
                !processId && 
                <SchemeMenu {...otherProps} schemeCode={code} onNewScheme={createOrLoad} onCreateProcess={onCreateProcess} />
            }
            {
                !!processId &&
                <ProcessMenu processId={processId} afterCommandExecuted={refrestDesigner} />
            }
            <WorkflowDesigner
                schemeCode={code}
                processId={processId}
                designerConfig={designerConfig}
                ref={designerRef}
            />
        </Container>
    );
};

export default Designer;