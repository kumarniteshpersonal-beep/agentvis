from pydantic import BaseModel

class SelectedDocument(BaseModel):
    document_index: int
    confidence_score: float