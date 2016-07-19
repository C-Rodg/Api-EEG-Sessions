
<%@ LANGUAGE=VBScript %>
<% OPTION EXPLICIT %>

<%
	Dim authenticate
	Set authenticate = CreateObject("MSXML2.XMLHTTP")
	authenticate.Open "Post", "https://login.salesforce.com/services/Soap/c/24.0/", False
	authenticate.SetRequestHeader "Content-Type", "text/xml"
	authenticate.SetRequestHeader "SOAPAction", "application/soap+xml"
	authenticate.SetRequestHeader "Content-Length", Request.TotalBytes

	dim b
	b = Request.TotalBytes

	dim x
	x = Request.BinaryRead(b)

	authenticate.Send(x)

	If authenticate.Status <> 200 Then
	    Response.Write("Error: " & authenticate.responseText)
	Else
  	    Response.ContentType = "text/xml"
  		Response.Write authenticate.responsexml.xml
	End If	
%>