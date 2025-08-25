from fastapi.responses import JSONResponse
from typing import Any

def format_success_response(data: Any, message: str = "Success") -> JSONResponse:
    """
    Format a successful response with data and a message.
    
    Args:
        data (Any): The data to include in the response.
        message (str): A success message.
        
    Returns:
        JSONResponse: A formatted JSON response.
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "success",
            "message": message,
            "data": data
        }
    )

def format_error_response(error_message: str, status_code: int = 400) -> JSONResponse:
    """
    Format an error response with an error message.
    Args:
        error_message (str): The error message to include in the response.
        status_code (int): The HTTP status code for the error response.
    Returns:
        JSONResponse: A formatted JSON response for the error.
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "error",
            "message": error_message
        }
    )