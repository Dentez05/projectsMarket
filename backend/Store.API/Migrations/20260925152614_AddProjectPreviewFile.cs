using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectPreviewFile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PreviewFileId",
                table: "projects",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_projects_PreviewFileId",
                table: "projects",
                column: "PreviewFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_projects_project_files_PreviewFileId",
                table: "projects",
                column: "PreviewFileId",
                principalTable: "project_files",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_projects_project_files_PreviewFileId",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_projects_PreviewFileId",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PreviewFileId",
                table: "projects");
        }
    }
}
