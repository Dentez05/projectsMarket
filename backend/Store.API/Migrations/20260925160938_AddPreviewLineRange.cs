using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPreviewLineRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PreviewEndLine",
                table: "projects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PreviewStartLine",
                table: "projects",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreviewEndLine",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PreviewStartLine",
                table: "projects");
        }
    }
}
