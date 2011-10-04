package controllers;

import play.*;
import play.mvc.*;

import java.util.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.regex.PatternSyntaxException;

import models.*;

public class Regex extends Controller {
   final static String openTag = "[span class=\"match\"]";
   final static String openTagResult = "<span class=\"match\">";
   final static String closeTag = "[/span]";
   final static String closeTagResult = "</span>";

   public static void do_test() {
      String message_id = params.get("message_id");
      String regex = params.get("regex");
      String data = params.get("test");
      String options = params.get("options");
      String response = "";

      if( regex.length() <= 0 || data.length() <= 0 ) {
         response = "<div class=\"notice\" id=\"start_instructions\">Jabular is a Java-based regular expression editor. It's a handy way to test regular expressions as you write them.<br /><br />To start, enter a regular expression and a test string. Or you can <a href=\"#\" onclick=\"Jabular.example(); return false;\">try an example</a>.</div>";
      } else {
         // Do the job !
         try {
            int flags = 0;

            if(options.indexOf('i') > -1) {
               flags |= Pattern.CASE_INSENSITIVE;
            }
            if(options.indexOf('d') > -1) {
               flags |= Pattern.UNIX_LINES;
            }
            if(options.indexOf('m') > -1) {
               flags |= Pattern.MULTILINE;
            }
            if(options.indexOf('s') > -1) {
               flags |= Pattern.DOTALL;
            }
            if(options.indexOf('u') > -1) {
               flags |= Pattern.UNICODE_CASE;
            }
            if(options.indexOf('x') > -1) {
               flags |= Pattern.COMMENTS;
            }

            String result = data;
            int correction = 0;

            String captures = ""; 

            Pattern p = Pattern.compile(regex, flags);
            Matcher m = p.matcher(data);
            int group = 0;

            while( m.find() ) {
               if( m.groupCount() > 0 ) {
                  captures += "<p>Result " + ++group + "</p><ol>";
                  for( int i = 1; i <= m.groupCount(); i++ ) {
                     if(m.group(i) == null) {
                        captures += "<li>&nbsp;</li>";
                     } else {
                        captures += "<li>" + m.group(i).replace("<", "&lt;")
                           .replace(">", "&gt;")
                           .replace("\n", "<br />")
                           .replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;") + "</li>";
                     }
                  }
                  captures += "</ol>";
               }

               String partOne = result.substring(0, m.start()+correction);
               String partTwo = result.substring(m.start()+correction);
               result = partOne + openTag + partTwo;
               correction += openTag.length();

               partOne = result.substring(0, m.end()+correction);
               partTwo = result.substring(m.end()+correction);
               result = partOne + closeTag + partTwo;
               correction += closeTag.length();
            }

            result = result.replace("<", "&lt;")
               .replace(">", "&gt;")
               .replace(openTag, openTagResult)
               .replace(closeTag, closeTagResult)
               .replace("\n", "<br />");

            // Final response
            response = "<span class=\"result_label\">Match result:</span>" + 
               "<div id=\"match_string\" class=\"\">" + 
               "<span id=\"match_string_inner\">" + result + "</span>" + 
               "</div>";

            if(captures.length() > 0) {
               response += "<span class=\"result_label\">Match captures:</span>" + 
                  "<div id=\"match_captures\">" + captures + "</div>";
            }
         } catch(PatternSyntaxException e) {
            int nl = e.getMessage().indexOf('\n');
            response = "<div class=\"error\">"+e.getMessage().substring(0,nl).replace("<", "&lt;").replace(">", "&gt;")+"</div>";
         } catch(Exception e) {
            Logger.info(e.getMessage());
            response = "<div class=\"error\">Something went wrong.<br />Please, correct your regex!</div>";
         }
      }

      // Logger.info("Response = " + response);

      // OK, send the result !
      request.format = "js";
      response = response.replace("\"", "\\\"");
      render(message_id, response);
   }

   public static void make_permalink() {
      request.format = "js";
      render();
   }

}
