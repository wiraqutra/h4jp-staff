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
    var projects = [];
    $("#sort").change(function() {
        var option = this.options[this.selectedIndex];
        switch (option.value) {
        case "status":
            sortByStatus();
            break;
        case "lastModified":
            sortByLastModified();
            break;
        default:
            renderIndexOfProjects(projects);
        }
    });
    function sortByLastModified() {
        var cloneProjects = projects.concat([]);
        cloneProjects.sort(function(a, b) {
            var dateA = string2Time(a.lastModified);
            var dateB = string2Time(b.lastModified);
            return dateB - dateA;
        });
        renderIndexOfProjects(cloneProjects);
    }
    function string2Time(s) {
        if (!s) {
            return -Infinity;
        }
        var tokens = s.split("/");
        var month = parseInt(tokens[0], 10);
        var date = parseInt(tokens[1], 10);
        var year = parseInt(tokens[2], 10);
        return new Date(year, month - 1, date).getTime();
    }
    function sortByStatus() {
        var active = [];
        var nonactive = [];
        var dead = [];
        for (var i = 0; i < projects.length; i++) {
            var project = projects[i];
            switch (project.status) {
            case "活動中":
                active.push(project);
                break;
            case "活動停止中":
                nonactive.push(project);
                break;
            default:
                dead.push(project);
                break;
            }
        }
        renderIndexOfProjects(active.concat(nonactive.concat(dead)));
    }
    function init(callback) {
        var query = new google.visualization.Query(PROJECTS_DATASOURCE_URL);
        query.setQuery("select * where A <> '' offset 1");
        query.send(function(response) {
            if (response.isError()) {
                alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
                return;
            }
            convertTable2Projects(response.getDataTable());
            renderIndexOfProjects(projects);
            callback();
        });
    }
    function renderIndexOfProjects(projects) {
        var projectList = $("<ul id='projectList'/>").appendTo($("#projectListArea").empty());
        for (var i = 0; i < projects.length; i++) {
            var project = projects[i];
            // Add row to projects list
            var projectClone = $.extend({}, project, {
                encodeURIComponent: encodeURIComponent,
                truncate: function(str, len) {
                    if (str.length > len) {
                        return str.substring(0, len - 3) + "...";
                    }
                    return str;
                }
            });
            $.tmpl(projectListItemTemplate, projectClone).appendTo(projectList);
        }
    }
    function convertTable2Projects(table) {
        var rowCount = table.getNumberOfRows();
        for (var i = 0; i < rowCount; i++) {
            var project = {
                name: table.getFormattedValue(i, ProjectProperties.NAME),
                description: table.getFormattedValue(i, ProjectProperties.DESCRIPTION),
                url: table.getFormattedValue(i, ProjectProperties.URL),
                leader: table.getFormattedValue(i, ProjectProperties.LEADER),
                members: table.getFormattedValue(i, ProjectProperties.MEMBERS),
                skills: table.getFormattedValue(i, ProjectProperties.SKILLS),
                hotToJoin: table.getFormattedValue(i, ProjectProperties.HOW_TO_JOIN),
                place: table.getFormattedValue(i, ProjectProperties.PLACE),
                moderatorURL: table.getFormattedValue(i, ProjectProperties.MODERATOR_URL),
                discussionURL: table.getFormattedValue(i, ProjectProperties.DISCUSSION_URL),
                status: table.getFormattedValue(i, ProjectProperties.STATUS),
                license: table.getFormattedValue(i, ProjectProperties.LICENSE),
                lastModified: table.getFormattedValue(i, ProjectProperties.LAST_MODIFIED),
                comment: table.getFormattedValue(i, ProjectProperties.COMMENT),
                image: table.getFormattedValue(i, ProjectProperties.IMAGE) || NO_IMAGE_URL
            };
            var leader = table.getFormattedValue(i, ProjectProperties.LEADER);
            var image = table.getFormattedValue(i, ProjectProperties.IMAGE);

            // mail address
            if (leader.match(/^[A-Za-z0-9]+[\w-]+@[\w\.-]+\.\w{2,}$/)) {
                project.leaderLink = "mailto:" + encodeURIComponent(leader);
            }
            // twitter (may be)
            else if (leader.charAt(0) == "@") {
                project.leaderLink = "http://twitter.com/" + encodeURIComponent(leader.substring(1));
            }
            // HTTP URL
            else if (leader.match(/^http\:\/\/[\w\.-]+$/)) {
                project.leaderLink = leader;
            }
            project.image = image || NO_IMAGE_URL;

            projects.push(project);
        }
    }
    function findProjectByName(projectName) {
        for (var i = 0, n = projects.length; i < n; i++) {
            if (projectName === projects[i].name) {
                return projects[i];
            }
        }
        return null;
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
        var project = findProjectByName(projectName);
        $("#projectListPage").fadeOut();
        $("#projectDetailPageContent").empty().append(
            $.tmpl(projectDetailPageTemplate, project));
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
