"use strict";var themes=require("../themes"),_=require("lodash"),sample="Morbi ornare pulvinar metus, non faucibus arcu ultricies non.";exports.command="ls",exports.desc="Get a list of installed themes",exports.builder={},exports.handler=function(e){var s=themes.getThemes();_.each(s,function(e){var s=e,r=themes.loadTheme(s);themes.labelDown(s,r,sample)})};