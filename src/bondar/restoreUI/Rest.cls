Class bondar.restoreUI.Rest Extends %CSP.REST
{

Parameter CONTENTTYPE = "application/json";

Parameter CHARSET = "UTF-8";

Parameter CONVERTINPUTSTREAM = 1;

Parameter HandleCorsRequest = 1;

XData UrlMap [ XMLNamespace = "http://www.intersystems.com/urlmap" ]
{
<Routes>
<Route Url="/GetBackupVolumeInfo/:fileName" Method="GET" Call="GetBackupVolumeInfo" />
<Route Url="/do-restore" Method="POST" Call="DoRestore"/>
</Routes>
}

ClassMethod GetBackupVolumeInfo(fileName) As %Status
{
    // for debug
    // set fileName = "/usr/irissys/mgr/Backup/FullDBList_20201004_001.cbk" // TODO: del

    set fileName = $ZConvert(fileName,"I","URL")
    set fileName = $Replace(fileName,":","/")
 
    set result = {}
    set result.databases = []
    set ns = $Namespace
    set $Namespace = "%SYS"
    set Status=##Class(Backup.General).GetBackupVolumeInfo(fileName,.Info)
    set $Namespace = ns
    if '(''Status) {
	 set result.status = $SYSTEM.Status.GetErrorText(Status)
     write result.%ToJSON()
	 quit $$$OK
    }
    set key = $order(Info("Database",""))
    While key'="" {
        set db = {}
        set db.directory = $get(Info("Database",key,"Directory"))
        do result.databases.%Push(db)
        set key = $order(Info("Database",key))
    }
    
    set result.status = "OK"
    write result.%ToJSON()
    quit $$$OK
}

ClassMethod DoRestore() As %Status
{
    If '..GetJSONFromRequest(.obj) {
		Set %response.Status = ..#HTTP400BADREQUEST
		Set error = {"errormessage": "JSON not found"}
		Write error.%ToJSON()
		Quit $$$OK
	}
    set tempDir = ^%SYS("TempDir")
    	
    set ptemp=##class(%Stream.FileCharacter).%New()
    set ptemp.Filename=tempDir_"/RestoreList.txt"
    set iter = obj.restoreDirectoryList.%GetIterator()
    while iter.%GetNext(.key, .value) { 
        Do ptemp.WriteLine(value.sourceDir_","_value.targetDir_","_$select(+value.createDir:"Y",1:"N"))
          
    }
    set sc = ptemp.%Save()


    set ns = $Namespace
    set $Namespace = "%SYS"
    job EXTSELCT^DBREST(1,0,obj.sourceDir,tempDir_"/RestoreList.txt",4,"","")
    set $Namespace = ns

    set result = {}

    set result.status = $s($$$ISERR(sc):$system.Status.GetOneErrorText(sc),1:"OK")
    write result.%ToJSON()
    quit $$$OK
}

ClassMethod GetJSONFromRequest(Output obj As %DynamicObject) As %Boolean
{
	Set ok = 1
	Try {
		Set obj = ##class(%DynamicObject).%FromJSON(%request.Content)
	} Catch ex {
		Set ok = 0
	}
	Quit ok
}

}
