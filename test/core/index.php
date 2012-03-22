<!DOCTYPE HTML>
<html>
<head>
    <title>TerrificJS Tests</title>

    <link rel="stylesheet" type="text/css" href="css/qunit.css" media="screen" />
    <script type="text/javascript" src="../../src/jquery/jquery-1.7.2.min.js"></script>
    <!-- terrific js release -->
    <!-- <script type="text/javascript" src="../../release/terrific-1.0.0.min.js"></script> -->

    <!-- terrific js sources -->
    <script type="text/javascript" src="../../src/core/oo.js"></script>
    <script type="text/javascript" src="../../src/core/Tc.js"></script>
    <script type="text/javascript" src="../../src/core/Tc.Config.js"></script>
    <script type="text/javascript" src="../../src/core/Tc.Application.js"></script>
    <script type="text/javascript" src="../../src/core/Tc.Sandbox.js"></script>
    <script type="text/javascript" src="../../src/core/Tc.Module.js"></script>
    <script type="text/javascript" src="../../src/core/Tc.Connector.js"></script>
    <script type="text/javascript" src="../../src/core/Tc.Utils.js"></script>
    <script type="text/javascript" src="../../src/core/Tc.Utils.String.js"></script>

    <!-- testing -->
    <script type="text/javascript" src="js/qunit.js"></script>
    <script type="text/javascript" src="js/jquery.tmpl.js"></script>
    <script type="text/javascript" src="tests/application.js"></script>
    <script type="text/javascript" src="tests/module.js"></script>
</head>
<body>
    <?php
        require_once("templates.html");
    ?>
    <h1 id="qunit-header">TerrificJS</h1>
    <h2 id="qunit-banner"></h2>
    <div id="qunit-testrunner-toolbar">
    </div>
    <h2 id="qunit-userAgent"></h2>
    <ol id="qunit-tests">
    </ol>
    <div id="qunit-fixture">
        test markup, will be hidden
    </div>
</body>
</html>
