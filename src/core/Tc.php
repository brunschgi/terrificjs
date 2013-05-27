<?php

// concatenate all core js files
echo file_get_contents('Tc.Start.js');
echo file_get_contents('oo.js');
echo file_get_contents('Tc.Config.js');
echo file_get_contents('Tc.Application.js');
echo file_get_contents('Tc.Sandbox.js');
echo file_get_contents('Tc.Module.js');
echo file_get_contents('Tc.Connector.js');
echo file_get_contents('Tc.Utils.js');
echo file_get_contents('Tc.Utils.String.js');
echo file_get_contents('Tc.End.js');