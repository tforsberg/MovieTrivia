//using System;
using System.Collections.Generic;
//using System.IO;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Text;
using HtmlAgilityPack;


namespace RESTService.Lib
{
     [ServiceBehavior(InstanceContextMode = InstanceContextMode.Single, ConcurrencyMode = ConcurrencyMode.Single, IncludeExceptionDetailInFaults = true)]
     [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class MovieService : IMovieService
    {
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        public string GetData()
        {
            var web = new HtmlWeb();
            var doc1 = web.Load("http://www.imdb.com/chart/top?ref_=nb_mv_3_chttp");

           var movies = new List<Movie>();



            //int count = 0;
            foreach (var nodes in doc1.DocumentNode.SelectNodes("//td[contains(@class,'titleColumn')]"))
            {
                //if (count < 10)
                //{
                    var doc2 = new HtmlDocument();
                    doc2.LoadHtml(nodes.InnerHtml);

                    var newMovie = new Movie();

                    foreach (var node2 in doc2.DocumentNode.SelectNodes("//*"))
                    {
                        if (node2.Attributes["class"] != null)
                        {
                            newMovie.Year = node2.InnerText.TrimStart('(').TrimEnd(')');
                        }
                        else
                        {
                            if (node2.Attributes["title"] != null)
                            {
                                newMovie.Title = node2.InnerText;
                            }
                        }
                    }

                    movies.Add(newMovie);
                    //count ++;
                //}
            }

            var ser = new DataContractJsonSerializer(typeof(List<Movie>));
            var ms = new MemoryStream();
            ser.WriteObject(ms, movies);
            string jsonString = Encoding.UTF8.GetString(ms.ToArray());
            ms.Close();

            //string a = jsonString.Replace(@"\""", @"""");
            //string b = jsonString;

            return jsonString;
        }

    }

    [DataContract]
     public class Movie
     {
         [DataMember]
         public string Title;

         [DataMember]
         public string Year;
     }
}
