file://localhost/Users/shumpei/Dropbox/hack4jp/tmp/h4jp-staff/hack-for-japan.appspot.com/src/static/shumpei.shiraishi@gmail.com
google.load('visualization', '1');
google.setOnLoadCallback(function() {
    var ProjectProperties = {
        NAME: 0,
        DESCRIPTION: 1,
        URL: 2,
        LEADER: 3,
        MEMBERS: 4,
        SKILLS: 5,
        HOW_TO_JOIN: 6,
        PLACE: 7,
        MODERATOR_URL: 8,
        DISCUSSION_URL: 9,
        STATUS: 10,
        LICENSE: 14,
        LAST_MODIFIED: 15,
        COMMENT: 16,
        IMAGE: 17,
        MAIL_ADDRESS: 18
    };
    var NO_IMAGE_URL = "images/noImage.jpg";
    var PROJECTS_DATASOURCE_URL = "https://spreadsheets.google.com/spreadsheet/ccc?key=0Avz5Dw63IZCSdGlfUlJhUmRoX19hZ2xTODYteXdGUVE#gid=0";
//        "https://spreadsheets.google.com/spreadsheet/ccc?key=0Amb6cvTCzTQRdFJzQWswd1NrVWk0d0NCWnhPSklUdXc&hl=en_US";
    var projectListItemTemplate = $("#projectListItemTemplate").template();
    var projectDetailPageTemplate = $("#projectDetailPageTemplate").template();
    var PROJECT_ID_PREFIX = "project_";
    var data;
    
    function init(callback) {
        var query = new google.visualization.Query(PROJECTS_DATASOURCE_URL);
        query.setQuery("select * where A <> '' offset 1");
        query.send(function(response) {
            if (response.isError()) {
                alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
                return;
            }
            data = response.getDataTable();
            var rowCount = data.getNumberOfRows();
            var colCount = data.getNumberOfColumns();
            
            var projectList = $("<ul id='projectList'/>").appendTo($("#projectListArea").empty());
            for (var i = 0; i < rowCount; i++) {
                var name = data.getFormattedValue(i, ProjectProperties.NAME);
                var description = data.getFormattedValue(i, ProjectProperties.DESCRIPTION);
                var url = data.getFormattedValue(i, ProjectProperties.URL);
                var leader = data.getFormattedValue(i, ProjectProperties.LEADER);
                var image = data.getFormattedValue(i, ProjectProperties.IMAGE);
                var leaderLink = null;
                // mail address
                if (leader.match(/^[A-Za-z0-9]+[\w-]+@[\w\.-]+\.\w{2,}$/)) {
                    leaderLink = "mailto:" + encodeURIComponent(leader);
                }
                // twitter (may be)
                else if (leader.charAt(0) == "@") {
                    leaderLink = "http://twitter.com/" + encodeURIComponent(leader.substring(1));
                }
                // HTTP URL
                else if (leader.match(/^http\:\/\/[\w\.-]+$/)) {
                    leaderLink = leader;
                }
                image = image || NO_IMAGE_URL;
                // Add row to projects list
                $.tmpl(projectListItemTemplate, {
                    name: name,
                    description: description,
                    url: url,
                    leader: leader,
                    leaderLink: leaderLink,
                    encodeURIComponent: encodeURIComponent,
                    image: image,
                    truncate: function(str, len) {
                        if (str.length > len) {
                            return str.substring(0, len - 3) + "...";
                        }
                        return str;
                    }
                }).appendTo(projectList);
            }
            callback();
        });
    }
    function findProjectIndex(projectName) {
        var rowCount = data.getNumberOfRows();
        for (var i = 0; i < rowCount; i++) {
            var name = data.getFormattedValue(i, ProjectProperties.NAME);
            if (projectName === name) {
                return i;
            }
        }
        return -1;
    }
    function renderDetailPage() {
        var projectName = location.hash;
        if (projectName.length == 0) {
            returnToTop();
            return false;
        }
        if (projectName.indexOf(PROJECT_ID_PREFIX) === -1) {
            return false;
        }
        projectName = projectName.substring(PROJECT_ID_PREFIX.length + 1);
        projectName = decodeURIComponent(projectName);
        var index = findProjectIndex(projectName);
        var tmplParams = {
            name: data.getFormattedValue(index, ProjectProperties.NAME),
            description: data.getFormattedValue(index, ProjectProperties.DESCRIPTION),
            url: data.getFormattedValue(index, ProjectProperties.URL),
            leader: data.getFormattedValue(index, ProjectProperties.LEADER),
            members: data.getFormattedValue(index, ProjectProperties.MEMBERS),
            skills: data.getFormattedValue(index, ProjectProperties.SKILLS),
            hotToJoin: data.getFormattedValue(index, ProjectProperties.HOW_TO_JOIN),
            place: data.getFormattedValue(index, ProjectProperties.PLACE),
            moderatorURL: data.getFormattedValue(index, ProjectProperties.MODERATOR_URL),
            descussionURL: data.getFormattedValue(index, ProjectProperties.DISCUSSION_URL),
            status: data.getFormattedValue(index, ProjectProperties.STATUS),
//            license: data.getFormattedValue(index, ProjectProperties.LICENSE),
//            lastModified: data.getFormattedValue(index, ProjectProperties.LAST_MODIFIED),
//            comment: data.getFormattedValue(index, ProjectProperties.COMMENT),
            image: data.getFormattedValue(index, ProjectProperties.IMAGE) || NO_IMAGE_URL
        };
        $("#projectListPage").fadeOut();
        $("#projectDetailPageContent").empty().append(
            $.tmpl(projectDetailPageTemplate, tmplParams));
        // Google +1
        gapi.plusone.render("plusoneButton", {
            size: "small",
            count: true,
            href: location.href
        });
        // Facebook Like
        var fbLikeButton = $("#facebookLikeButton")[0];
        fbLikeButton.src = fbLikeButton.src.replace(/href=([^\&]*)\&/, "href=" + encodeURIComponent(location.href) + "&");
        // Facebook Comments
        $("#fbComments").attr("href", location.href);
        
        $("#projectDetailPage").fadeIn();
        return true;
    }
    $(window).hashchange(renderDetailPage);

    function returnToTop() {
        $("#projectDetailPage").fadeOut();
        $("#projectListPage").fadeIn();
    }
    init(renderDetailPage);
});
